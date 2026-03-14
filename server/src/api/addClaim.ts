import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getOrSetUsername } from '../utils.ts'
import { analyseClaim, analyseClaimStakeholders } from '../analyse/claim.ts'

export const addClaim: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const claimText = req.body.text
  const results = await sql`
    INSERT INTO statement ${sql({
      text: claimText,
      owner
    })}
    RETURNING *
  `.catch(onError)
  const claimId = results[0].id
  await sql`
    INSERT INTO tagged ${sql({
      statement_id: claimId,
      tag: req.body.tag
    })}
  `.catch(onError)

  await sql`
    INSERT INTO move ${sql({
      claim_id: claimId,
      type: 'addClaim',
      owner
    })}
  `.catch(onError)

  const countryCode = req.body.countryCode
  if (countryCode) {
    await sql`
      INSERT INTO national ${sql({
        statement_id: claimId,
        country_code: countryCode
      })}
    `.catch(onError)

    // do not wait for this
    analyseClaim(claimText).then(async output => {
      if (output === 'violation') {
        await sql`
          DELETE FROM statement
          WHERE statement.id = ${claimId}
        `.catch(onError)
      } else if (output === 'prescriptive') {
        await sql`
          INSERT INTO prescriptive ${sql({
            statement_id: claimId
          })}
        `.catch(onError)
        if (countryCode === 'other') {
          const stakeholders = await analyseClaimStakeholders(claimText)
          if (stakeholders) {
            await sql`
              INSERT INTO stakeholders ${sql({
                statement_id: claimId,
                group_name: stakeholders
              })}
            `.catch(onError)
          }
        }
        // TODO: analyse consequences if they were already added
      }
    })
  }

  res.json({ savedId: claimId })
}
