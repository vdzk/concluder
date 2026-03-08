import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'

export const getArgumentsByClaimId: RequestHandler = async (req, res) => {
  const results = await sql`
    SELECT a.id, a.claim_id, a.text, a.pro, a.strength,
      consequence.wtp,
      owner = ${req.cookies.name ?? 'free-for-all'} AS editable,
      EXISTS (
        SELECT 1
        FROM premise
        WHERE premise.argument_id = a.id
      ) AS "hasPremise"
    FROM argument AS a
    LEFT JOIN consequence ON consequence.argument_id = a.id
    WHERE claim_id = ${req.body.claimId}
  `.catch(onError)
  res.json(results)
}
