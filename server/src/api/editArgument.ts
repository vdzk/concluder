import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { cascadeUpdateScores } from '../cascadeUpdateScores.ts'
import { saveScoreChange } from '../saveScoreChange.ts'
import { processNewArgument } from '../processNewArgument.ts'

export const editArgument: RequestHandler = async (req, res) => {
  const owner = req.cookies.name
  const { id, pro, strength, text } = req.body
  const hasPremise = await sql`
    SELECT EXISTS (
      SELECT 1 FROM premise WHERE argument_id = ${id}
    ) AS "hasPremise"
  `.then(r => r[0].hasPremise).catch(onError)
  const results = await sql`
    UPDATE argument
    SET pro = ${pro},
      strength = ${hasPremise ? sql`strength` : sql`${strength}`},
      text = ${text}
    WHERE id = ${id}
      AND owner = ${owner ?? 'free-for-all'}
    RETURNING claim_id
  `.catch(onError)
  const claimId = results[0].claim_id
  const scoreChanges = await cascadeUpdateScores(claimId)
  res.json({ scoreChanges })

  saveScoreChange(scoreChanges, owner, {
    type: 'editArgument',
    argument: req.body
  })

  // Update or create the associated consequence in the background
  processNewArgument(claimId, id, text, pro)
}
