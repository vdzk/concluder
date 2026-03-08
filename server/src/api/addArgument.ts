import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getOrSetUsername } from '../utils.ts'
import { cascadeUpdateScores } from '../cascadeUpdateScores.ts'
import { saveScoreChange } from '../saveScoreChange.ts'
import { processNewArgument } from '../processNewArgument.ts'

export const addArgumentReusable = async (
  argument: any,
  owner: string
) => {
  const claimId = argument.claim_id

  const results = await sql`
    INSERT INTO argument ${sql({...argument, owner})}
    RETURNING id
  `.catch(onError)

  const argumentId = results[0].id

  const scoreChanges = await cascadeUpdateScores(claimId)

  saveScoreChange(scoreChanges, owner, {
    type: 'addArgument',
    argument: argument
  })

  // This is done in the background to avoid blocking the user
  processNewArgument(claimId, argumentId, argument.text, argument.pro)

  return { savedId: argumentId, scoreChanges }
}

export const addArgument: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  res.json(await addArgumentReusable(req.body, owner))
}
