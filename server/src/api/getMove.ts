import { type RequestHandler } from "express"
import { onError, sql } from "../db.ts"
import { type GetMoveResponse } from "../../../shared/types.ts"

export const getMove: RequestHandler = async (req, res) => {
  const moveId = req.body.id

  const [move] = await sql`
    SELECT id, type, argument_id, owner, claim_id
    FROM move
    WHERE id = ${moveId}
  `.catch(onError) as unknown as GetMoveResponse['move'][]

  const [claimStatement] = await sql`
    SELECT id, text, likelihood
    FROM statement
    WHERE id = ${move.claim_id}
  `.catch(onError) as unknown as GetMoveResponse['claimStatement'][]

  const [argument] = await sql`
    SELECT id, claim_id, text, pro, strength
    FROM argument
    WHERE id = ${move.argument_id}
  `.catch(onError) as unknown as GetMoveResponse['argument'][]

  let statement: GetMoveResponse['statement']
  if (argument) {
    const [stmt] = await sql`
      SELECT id, text, likelihood
      FROM statement
      WHERE id = ${argument.claim_id}
    `.catch(onError) as unknown as GetMoveResponse['statement'][]
    statement = stmt
  } else {
    statement = claimStatement
  }

  const [avatar] = await sql`
    SELECT id, svg, display_name
    FROM avatar
    WHERE owner = ${move.owner}
    LIMIT 1
  `.catch(onError) as unknown as GetMoveResponse['avatar'][]

  let targetStatement: GetMoveResponse['targetStatement'] = null
  let targetArgument: GetMoveResponse['targetArgument'] = null
  let targetArgumentClaim: GetMoveResponse['targetArgumentClaim'] = null
  if (argument && argument.claim_id !== move.claim_id) {
    targetStatement = statement

    const [premiseRow] = await sql`
      SELECT argument_id
      FROM premise
      WHERE statement_id = ${argument.claim_id}
      LIMIT 1
    `.catch(onError) as unknown as { argument_id: number }[]

    if (premiseRow) {
      const [parentArg] = await sql`
        SELECT id, claim_id, text, pro, strength
        FROM argument
        WHERE id = ${premiseRow.argument_id}
      `.catch(onError) as unknown as GetMoveResponse['targetArgument'][]
      targetArgument = parentArg ?? null
      if (targetArgument) {
        const [parentClaim] = await sql`
          SELECT id, text, likelihood
          FROM statement
          WHERE id = ${targetArgument.claim_id}
        `.catch(onError) as unknown as GetMoveResponse['targetArgumentClaim'][]
        targetArgumentClaim = parentClaim ?? null
      }
    }
  }

  const siblings = await sql`
    SELECT id FROM move
    WHERE claim_id = ${move.claim_id}
    ORDER BY id
  `.catch(onError) as unknown as { id: number }[]

  const idx = siblings.findIndex(s => s.id === move.id)
  const nav: GetMoveResponse['nav'] = {
    current: idx + 1,
    total: siblings.length,
    prevMoveId: idx > 0 ? siblings[idx - 1].id : null,
    nextMoveId: idx < siblings.length - 1 ? siblings[idx + 1].id : null,
    firstMoveId: siblings.length > 0 ? siblings[0].id : null,
    lastMoveId: siblings.length > 0 ? siblings[siblings.length - 1].id : null,
  }

  res.json({ move, claimStatement, statement, argument, avatar, nav, targetStatement, targetArgument, targetArgumentClaim } satisfies GetMoveResponse)
}