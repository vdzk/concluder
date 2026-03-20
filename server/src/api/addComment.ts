import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getOrSetUsername } from '../utils.ts'

export const addComment: RequestHandler = async (req, res) => {
  const owner = await getOrSetUsername(req, res)
  const text = req.body.text
  const targetKind: 'statement' | 'argument' | undefined = req.body.targetKind
  const targetId: number | undefined = req.body.targetId

  const row: Record<string, unknown> = { text, owner }
  if (targetKind === 'statement' && targetId !== undefined) row.statement_id = targetId
  if (targetKind === 'argument' && targetId !== undefined) row.argument_id = targetId

  const results = await sql`
    INSERT INTO comment ${sql(row)}
    RETURNING id
  `.catch(onError)
  const commentId = results[0].id
  res.json({ savedId: commentId })
}