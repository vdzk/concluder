import { type RequestHandler } from "express"
import { getOrSetUsername } from "../utils.ts"
import { onError, sql } from "../db.ts"
import { addPremiseReusable } from "./addPremise.ts"
import { cascadeUpdateScores } from "../cascadeUpdateScores.ts"
import { saveScoreChange } from "../saveScoreChange.ts"
import { updateMoveLikelihood } from "../updateMoveLikelihood.ts"

export const addHiddenPremiseMove: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const { targetArgumentId, premiseText, likelihood, move } = req.body

  const premise = await addPremiseReusable(
    premiseText,
    likelihood,
    owner,
    targetArgumentId
  )

  move.type = 'addHiddenPremise'
  const moveResults = await sql`
    INSERT INTO move ${sql({
      ...move, owner,
      premise_id: premise.id
    })}
    RETURNING id
  `.catch(onError)

  const scoreChanges = await cascadeUpdateScores(premise.statement_id, true)

  res.json({ savedId: moveResults[0].id, scoreChanges })

  updateMoveLikelihood(moveResults[0].id, move.claim_id, scoreChanges)

  saveScoreChange(scoreChanges, owner, {
    type: 'addHiddenPremise',
    premiseText,
    likelihood
  })
}
