import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getOrSetUsername } from '../utils.ts'
import { cascadeUpdateScores } from '../cascadeUpdateScores.ts'
import { saveScoreChange } from '../saveScoreChange.ts'

export const addPremiseReusable = async (
  text: string,
  likelihood: number,
  owner: string,
  argumentId: string
) => {
  const statementResults = await sql`
    INSERT INTO statement ${sql({
      text, likelihood, owner
    })}
    RETURNING id
  `.catch(onError)

  const statement_id = statementResults[0].id

  const premiseResults = await sql`
    INSERT INTO premise ${sql({
      argument_id: argumentId,
      statement_id: statement_id,
      owner
    })}
    RETURNING id
  `.catch(onError)

  const id = premiseResults[0].id

  return { id, statement_id }
}

export const addPremise: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const premise = await addPremiseReusable(
    req.body.text,
    req.body.likelihood,
    owner,
    req.body.argument_id
  )

  const scoreChanges = await cascadeUpdateScores(premise.statement_id, true)

  res.json({ savedId: premise.id, scoreChanges })

  saveScoreChange(scoreChanges, owner, {
    type: 'addPremise',
    statement: req.body
  })
}
