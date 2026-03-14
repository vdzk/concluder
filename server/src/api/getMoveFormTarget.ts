import { type RequestHandler } from "express"
import { onError, sql } from "../db.ts"
import { type MoveFormTarget, type StatementRecord, type ArgumentRecord } from "../../../shared/types.ts"

export const getMoveFormTarget: RequestHandler = async (req, res) => {
  const { targetType, targetId } = req.body

  if (targetType === 'argument') {
    const [argument] = await sql`
      SELECT id, claim_id, text, pro, strength
      FROM argument WHERE id = ${targetId}
    `.catch(onError) as unknown as ArgumentRecord[]

    const [claimStatement] = await sql`
      SELECT id, text, likelihood
      FROM statement WHERE id = ${argument.claim_id}
    `.catch(onError) as unknown as StatementRecord[]

    res.json({
      type: 'argument',
      id: argument.id,
      text: argument.text,
      pro: argument.pro,
      conclusionText: claimStatement.text,
    } satisfies MoveFormTarget)
    return
  }

  const [statement] = await sql`
    SELECT id, text, likelihood
    FROM statement WHERE id = ${targetId}
  `.catch(onError) as unknown as StatementRecord[]

  res.json({
    type: 'statement',
    id: statement.id,
    text: statement.text,
  } satisfies MoveFormTarget)
}
