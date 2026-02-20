import express from 'express'
import cookieParser from 'cookie-parser'
import { onError, sql } from "./db.ts"
import { cascadeUpdateScores } from './cascadeUpdateScores.ts'
import { getOrSetUsername } from './utils.ts'
import { analyseClaim, analyseClaimStakeholders } from './analyse/claim.ts'
import { processNewArgument } from './processNewArgument.ts'
const app = express()
const port = 3001
app.use(express.json())
app.use(cookieParser())


// NOTE: do not leak other owner usernames in responses!

app.post('/api/getTaggedClaims', async (req, res) => {
  const results = await sql`
    SELECT s.id, s.text, s.likelihood
    FROM statement AS s
    JOIN tagged
      ON tagged.statement_id = s.id
    ${req.body.tag === 'politics' ? sql`
      JOIN national
        ON national.statement_id = s.id
        AND national.country_code = ${req.body.countryCode}
    ` : sql``}
    WHERE tagged.tag = ${req.body.tag}
    ORDER BY s.id
  `.catch(onError)
  res.json(results)
})

app.post('/api/addClaim', async (req, res) => {
  const owner = getOrSetUsername(req, res)
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
})

app.post('/api/deleteStatement', async (req, res) => {
  const statementId = req.body.id
  // Pretend that the premise/claim is 100% true to update the parent scores properly before delting it
  await sql`
    UPDATE statement
    SET likelihood = 1
    WHERE statement.id = ${statementId}
  `.catch(onError)
  const scoreChanges = await cascadeUpdateScores(statementId, true, true)
  await sql`
    DELETE FROM statement
    WHERE id = ${req.body.id}
      AND owner = ${req.cookies.name ?? 'free-for-all'}
  `.catch(onError)
  res.json({scoreChanges})
})

app.post('/api/deleteArgument', async (req, res) => {
  const argumentResults = await sql`
    DELETE FROM argument
    WHERE id = ${req.body.id}
      AND owner = ${req.cookies.name ?? 'free-for-all'}
    RETURNING claim_id
  `.catch(onError)
  const scoreChanges = await cascadeUpdateScores(argumentResults[0].claim_id)
  res.json({scoreChanges})
})

const getStatementsByIds = (statementIds: number[], username?: string) => sql`
  SELECT id, text, likelihood,
    owner = ${username ?? 'free-for-all'} AS editable,
    EXISTS (
      SELECT 1
      FROM argument
      WHERE argument.claim_id = statement.id
    ) AS "hasArgument"
  FROM statement
  WHERE id IN ${sql(statementIds)}
`.catch(onError)

app.post('/api/getClaim', async (req, res) => {
  const results = await getStatementsByIds([req.body.id], req.cookies.name)
  const result = results[0]

  const taggedResults = await sql`
    SELECT tag
    FROM tagged
    WHERE statement_id = ${req.body.id}
  `.catch(onError)
  Object.assign(result, taggedResults[0])

  if (taggedResults[0].tag === 'politics') {
    const nationalResults = await sql`
      SELECT country_code
      FROM national
      WHERE statement_id = ${req.body.id}
    `.catch(onError)
    Object.assign(result, nationalResults[0])
  }

  res.json(result)
})

app.post('/api/getArgumentsByClaimId', async (req, res) => {
  const results = await sql`
    SELECT a.id, a.claim_id, a.text, a.pro, a.strength,
      consequence.wtp,
      owner = ${req.cookies.name ?? 'free-for-all'} AS editable,
      EXISTS (
        SELECT 1
        FROM premise
        WHERE premise.argument_id = a.id
      ) AS "hasPremise"
    FROM argument AS a
    LEFT JOIN consequence ON consequence.argument_id = a.id
    WHERE claim_id = ${req.body.claimId}
  `.catch(onError)
  res.json(results)
})

app.post('/api/getPremisesByArgumentId', async (req, res) => {
  const username = req.cookies.name
  const premises = await sql`
    SELECT id, argument_id, statement_id, invert,
      owner = ${username ?? 'free-for-all'} AS editable
    FROM premise
    WHERE argument_id = ${req.body.argumentId}
  `.catch(onError)
  const statementIds = premises.map(premise => premise.statement_id)
  const statements = await getStatementsByIds(statementIds, username)
  res.json({ premises, statements })
})

app.post('/api/addArgument', async (req, res) => {
  const owner = getOrSetUsername(req, res)
  const claimId = req.body.claim_id

  const results = await sql`
    INSERT INTO argument ${sql({...req.body, owner})}
    RETURNING id
  `.catch(onError)

  const argumentId = results[0].id

  const scoreChanges = await cascadeUpdateScores(claimId)

  res.json({ savedId: argumentId, scoreChanges })

  // This is done in the background to avoid blocking the user
  processNewArgument(claimId, argumentId, req.body.text, req.body.pro)
})

app.post('/api/addPremise', async (req, res) => {
  const owner = getOrSetUsername(req, res)
  const statementResults = await sql`
    INSERT INTO statement ${sql({
      text: req.body.text,
      likelihood: req.body.likelihood,
      owner
    })}
    RETURNING id
  `.catch(onError)

  const statementId = statementResults[0].id

  const premiseResults = await sql`
    INSERT INTO premise ${sql({
      argument_id: req.body.argument_id,
      statement_id: statementId,
      owner
    })}
    RETURNING id
  `.catch(onError)

  const premiseId = premiseResults[0].id

  const scoreChanges = await cascadeUpdateScores(statementId, true)

  res.json({ savedId: premiseId, scoreChanges })
})


app.post('/api/getConsequence', async (req, res) => {
  const results = await sql`
    SELECT outcome, derivation, wtp 
    FROM consequence
    WHERE consequence.argument_id = ${req.body.argumentId}
  `.catch(onError)

  res.json(results[0])
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})