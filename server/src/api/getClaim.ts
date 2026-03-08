import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getStatementsByIds } from './getStatementsByIds.ts'

export const getClaim: RequestHandler = async (req, res) => {
  const results = await getStatementsByIds([req.body.id], req.cookies.name)
  const result = results[0]

  const taggedResults = await sql`
    SELECT tag
    FROM tagged
    WHERE statement_id = ${req.body.id}
  `.catch(onError)
  Object.assign(result, taggedResults[0])

  if (taggedResults[0].tag === 'politics') {
    const nationalResults = await sql`
      SELECT country_code
      FROM national
      WHERE statement_id = ${req.body.id}
    `.catch(onError)
    Object.assign(result, nationalResults[0])
  }

  res.json(result)
}
