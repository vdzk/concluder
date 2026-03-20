import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getOrSetUsername } from '../utils.ts'
import { cascadeUpdateScores } from '../cascadeUpdateScores.ts'

interface Entry {
  id: number
  text: string
  targetId?: number
  score?: number
  type?: 'claim' | 'prem' | 'pro' | 'con'
}

export const applyCommentChanges: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const entries: Record<number, Entry> = req.body.entries

  // Maps from local entry id → database id
  const localToStatementId: Record<number, number> = {}
  const localToArgumentId: Record<number, number> = {}

  const entryList = Object.values(entries)
  const processed = new Set<number>()
  const claimIds: number[] = []

  // Iteratively process entries layer by layer, resolving dependencies each pass
  let madeProgress = true
  while (madeProgress && processed.size < entryList.length) {
    madeProgress = false

    for (const entry of entryList) {
      if (processed.has(entry.id) || !entry.type) continue

      if (entry.type === 'claim') {
        const results = await sql`
          INSERT INTO statement ${sql({
            text: entry.text,
            likelihood: entry.score != null ? entry.score / 100 : 0.5,
            owner
          })}
          RETURNING id
        `.catch(onError)

        localToStatementId[entry.id] = results[0].id
        claimIds.push(results[0].id)
        processed.add(entry.id)
        madeProgress = true
      }
      else if (entry.type === 'pro' || entry.type === 'con') {
        if (entry.targetId == null || !(entry.targetId in localToStatementId)) continue

        const results = await sql`
          INSERT INTO argument ${sql({
            claim_id: localToStatementId[entry.targetId],
            text: entry.text,
            pro: entry.type === 'pro',
            strength: entry.score != null ? entry.score / 100 : 0,
            owner
          })}
          RETURNING id
        `.catch(onError)

        localToArgumentId[entry.id] = results[0].id
        processed.add(entry.id)
        madeProgress = true
      }
      else if (entry.type === 'prem') {
        if (entry.targetId == null || !(entry.targetId in localToArgumentId)) continue

        const statementResults = await sql`
          INSERT INTO statement ${sql({
            text: entry.text,
            likelihood: entry.score != null ? entry.score / 100 : 0.5,
            owner
          })}
          RETURNING id
        `.catch(onError)

        const statementId = statementResults[0].id

        await sql`
          INSERT INTO premise ${sql({
            argument_id: localToArgumentId[entry.targetId],
            statement_id: statementId,
            owner
          })}
        `.catch(onError)

        // Premise statements can be targeted by sub-arguments
        localToStatementId[entry.id] = statementId
        processed.add(entry.id)
        madeProgress = true
      }
    }
  }

  if (claimIds.length > 0) {
    await sql`
      INSERT INTO exposed
      ${sql(claimIds.map(claimId => ({claim_id: claimId})))}
    `.catch(onError)

    await sql`
      UPDATE comment
      SET
        statement_id = ${claimIds[0]},
        processed = TRUE
      WHERE id = ${req.body.commentId}
    `.catch(onError)
  }

  // Find leaf premises: prem entries not targeted by any other entry
  const targetedIds = new Set(entryList.map(e => e.targetId).filter(id => id != null))
  const leafPremiseStatementIds = entryList
    .filter(e => e.type === 'prem' && !targetedIds.has(e.id))
    .map(e => localToStatementId[e.id])

  for (const statementId of leafPremiseStatementIds) {
    await cascadeUpdateScores(statementId, true)
  }

  res.json({ ok: true, localToStatementId, localToArgumentId })
}