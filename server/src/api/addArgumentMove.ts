import { type RequestHandler } from "express"
import { getOrSetUsername } from "../utils.ts"
import { addArgumentReusable } from "./addArgument.ts"
import { onError, sql } from "../db.ts"

export const addArgumentMove: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const { argument, move } = req.body
  const newArgument = await addArgumentReusable(argument, owner)

  const moveResults = await sql`
    INSERT INTO move ${sql({...move, owner,
      argument_id: newArgument.savedId
    })}
    RETURNING id
  `.catch(onError)

  res.json({ savedId: moveResults[0].id })
}