import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getOrSetUsername } from '../utils.ts'

export const addComment: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const text = req.body.text
  const results = await sql`
    INSERT INTO comment ${sql({text, owner})}
    RETURNING id
  `.catch(onError)
  const commentId = results[0].id
  res.json({ savedId: commentId })
}