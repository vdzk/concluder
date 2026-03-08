import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { cascadeUpdateScores } from '../cascadeUpdateScores.ts'
import { saveScoreChange } from '../saveScoreChange.ts'

export const deleteStatement: RequestHandler = async (req, res) => {
  const owner = req.cookies.name
  const statementId = req.body.id
  // Pretend that the premise/claim is 100% true to update the parent scores properly before deleting it
  const statementResults = await sql`
    UPDATE statement
    SET likelihood = 1
    WHERE statement.id = ${statementId}
    RETURNING id, text, likelihood
  `.catch(onError)
  const scoreChanges = await cascadeUpdateScores(statementId, true, true)
  await sql`
    DELETE FROM statement
    WHERE id = ${req.body.id}
      AND owner = ${owner ?? 'free-for-all'}
  `.catch(onError)
  res.json({scoreChanges})

  saveScoreChange(scoreChanges, owner, {
    type: 'deleteStatement',
    statement: statementResults[0]
  })
}
