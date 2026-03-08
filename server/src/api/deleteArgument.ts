import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { cascadeUpdateScores } from '../cascadeUpdateScores.ts'
import { saveScoreChange } from '../saveScoreChange.ts'

export const deleteArgument: RequestHandler = async (req, res) => {
  const owner = req.cookies.name
  const argumentResults = await sql`
    DELETE FROM argument
    WHERE id = ${req.body.id}
      AND owner = ${owner ?? 'free-for-all'}
    RETURNING id, claim_id, text, pro, strength
  `.catch(onError)
  const scoreChanges = await cascadeUpdateScores(argumentResults[0].claim_id)
  res.json({scoreChanges})

  saveScoreChange(scoreChanges, owner, {
    type: 'deleteArgument',
    argument: argumentResults[0]
  })
}
