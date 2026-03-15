import { type RequestHandler } from "express"
import { getOrSetUsername } from "../utils.ts"
import { addArgumentReusable } from "./addArgument.ts"
import { onError, sql } from "../db.ts"
import { addPremiseReusable } from "./addPremise.ts"
import { updateMoveLikelihood } from "../updateMoveLikelihood.ts"

// TODO: handle multi arguments

export const addPremiseArgumentMove: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const { targetArgumentId, argument, move } = req.body

  let premiseText = req.body.premiseText
  if (!premiseText) {
    // Form a single premise from the target argument text
    const targetArgumentResults = await sql`
      SELECT text
      FROM argument
      WHERE argument.id = ${targetArgumentId}
    `.catch(onError)
    premiseText = targetArgumentResults[0].text
  }

  const premise = await addPremiseReusable(
    premiseText,
    0.5,  // this will be updated by the argument added below
    owner,
    targetArgumentId
  )

  argument.claim_id = premise.statement_id

  const newArgument = await addArgumentReusable(argument, owner)

  move.type = 'addPremiseArgument'
  const moveResults = await sql`
    INSERT INTO move ${sql({
      ...move, owner,
      argument_id: newArgument.savedId
    })}
    RETURNING id
  `.catch(onError)

  res.json({ savedId: moveResults[0].id })

  updateMoveLikelihood(moveResults[0].id, move.claim_id, newArgument.scoreChanges)
}