import { onError, sql } from '../db.ts'

export const getStatementsByIds = (statementIds: number[], username?: string) => sql`
  SELECT id, text, likelihood,
    owner = ${username ?? 'free-for-all'} AS editable,
    EXISTS (
      SELECT 1
      FROM argument
      WHERE argument.claim_id = statement.id
    ) AS "hasArgument"
  FROM statement
  WHERE id IN ${sql(statementIds)}
`.catch(onError)
