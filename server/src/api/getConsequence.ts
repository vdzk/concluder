import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'

export const getConsequence: RequestHandler = async (req, res) => {
  const results = await sql`
    SELECT outcome, derivation, wtp 
    FROM consequence
    WHERE consequence.argument_id = ${req.body.argumentId}
  `.catch(onError)

  res.json(results[0])
}
