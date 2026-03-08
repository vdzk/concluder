import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'
import { getStatementsByIds } from './getStatementsByIds.ts'

export const getPremisesByArgumentId: RequestHandler = async (req, res) => {
  const username = req.cookies.name
  const premises = await sql`
    SELECT id, argument_id, statement_id, invert,
      owner = ${username ?? 'free-for-all'} AS editable
    FROM premise
    WHERE argument_id = ${req.body.argumentId}
  `.catch(onError)
  const statementIds = premises.map(premise => premise.statement_id)
  const statements = await getStatementsByIds(statementIds, username)
  res.json({ premises, statements })
}
