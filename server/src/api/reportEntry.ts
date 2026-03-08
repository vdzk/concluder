import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'

export const reportEntry: RequestHandler = async (req, res) => {
  await sql`
    INSERT INTO report ${sql(req.body)}
  `.catch(onError)
  res.json({})
}
