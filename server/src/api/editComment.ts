import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getOrSetUsername } from '../utils.ts'

export const editComment: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const id = req.body.id
  const text = req.body.text
  await sql`
    UPDATE comment
    SET text = ${text}
    WHERE id = ${id} AND owner = ${owner}
  `.catch(onError)
  res.json({})
}