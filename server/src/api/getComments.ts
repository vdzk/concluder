import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { type CommentRecord, type UnprocessedNewDebateComment } from '../../../shared/types.ts'

export const getComments: RequestHandler = async (req, res) => {
  const owner = req.cookies.name

  const whereCond = req.body.id
    ? sql`WHERE id = ${req.body.id}`
    : sql`WHERE true`

  const limitClause = req.body.procNext
    ? sql`LIMIT 1`
    : sql``

  const results = await sql<CommentRecord[]>`
    SELECT id, text, owner
    FROM comment
    ${whereCond}
    ORDER BY id
    ${limitClause}
  `.catch(onError)

  const comments: UnprocessedNewDebateComment[] = results.map(
    ({ owner: commentOwner, ...rest }) => ({
    ...rest,
    canEdit: owner === commentOwner,
  }))

  res.json(comments)
}