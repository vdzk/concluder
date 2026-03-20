import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'

export const getExposedClaims: RequestHandler = async (req, res) => {
  const results = await sql`
    SELECT s.id, s.text, s.likelihood
    FROM statement AS s
    JOIN exposed
      ON exposed.claim_id = s.id
    ORDER BY s.id
  `.catch(onError)
  res.json(results)
} 