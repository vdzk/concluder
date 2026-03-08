import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getOrSetUsername } from '../utils.ts'
import { cascadeUpdateScores } from '../cascadeUpdateScores.ts'
import { saveScoreChange } from '../saveScoreChange.ts'

export const addPremise: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
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

  saveScoreChange(scoreChanges, owner, {
    type: 'addPremise',
    statement: req.body
  })
}
