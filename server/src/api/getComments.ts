import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { type CommentRecord, type UnprocessedNewDebateComment } from '../../../shared/types.ts'

export const getComments: RequestHandler = async (req, res) => {
  const owner = req.cookies.name

  const conditions = []
  if (req.body.id) {
    conditions.push(sql`id = ${req.body.id}`)
  }
  if (req.body.processed === false) {
    conditions.push(sql`processed = false`)
  }
  if (req.body.newDebates) {
    conditions.push(sql`statement_id IS NULL AND argument_id IS NULL`)
  }

  const whereCond = conditions.length
    ? sql`WHERE ${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`
    : sql``

  const limitClause = req.body.single
    ? sql`LIMIT 1`
    : sql``

  const results = await sql<CommentRecord[]>`
    SELECT id, text, statement_id, argument_id, owner
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