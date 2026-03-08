import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'

export const getTaggedClaims: RequestHandler = async (req, res) => {
  const results = await sql`
    SELECT s.id, s.text, s.likelihood
    FROM statement AS s
    JOIN tagged
      ON tagged.statement_id = s.id
    ${req.body.tag === 'politics' ? sql`
      JOIN national
        ON national.statement_id = s.id
        AND national.country_code = ${req.body.countryCode}
    ` : sql``}
    WHERE tagged.tag = ${req.body.tag}
    ORDER BY s.id
  `.catch(onError)
  res.json(results)
}
