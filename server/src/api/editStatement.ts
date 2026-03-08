import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { cascadeUpdateScores } from '../cascadeUpdateScores.ts'
import { saveScoreChange } from '../saveScoreChange.ts'

export const editStatement: RequestHandler = async (req, res) => {
  const owner = req.cookies.name
  const { id, text, likelihood } = req.body
  const hasArgument = await sql`
    SELECT EXISTS (
      SELECT 1 FROM argument WHERE claim_id = ${id}
    ) AS "hasArgument"
  `.then(r => r[0].hasArgument).catch(onError)
  await sql`
    UPDATE statement
    SET text = ${text},
      likelihood = ${hasArgument ? sql`likelihood` : sql`${likelihood}`}
    WHERE id = ${id}
      AND owner = ${owner ?? 'free-for-all'}
  `.catch(onError)
  const scoreChanges = await cascadeUpdateScores(id, true)
  res.json({ scoreChanges })

  saveScoreChange(scoreChanges, owner, {
    type: 'editStatement',
    statement: req.body
  })
}
