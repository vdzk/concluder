import { type RequestHandler } from "express"
import { onError, sql } from "../db.ts"
import { type GetMoveResponse } from "../../../shared/types.ts"

export const getMove: RequestHandler = async (req, res) => {
  const moveId = req.body.id

  const [move] = await sql`
    SELECT id, type, argument_id, premise_id, owner, claim_id, claim_likelihood_before, claim_likelihood_after
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

  let premiseStatement: GetMoveResponse['premiseStatement'] = null
  if (move.premise_id) {
    const [premiseRow] = await sql`
      SELECT statement_id, argument_id
      FROM premise
      WHERE id = ${move.premise_id}
    `.catch(onError) as unknown as { statement_id: number; argument_id: number }[]

    if (premiseRow) {
      const [stmt] = await sql`
        SELECT id, text, likelihood
        FROM statement
        WHERE id = ${premiseRow.statement_id}
      `.catch(onError) as unknown as GetMoveResponse['premiseStatement'][]
      premiseStatement = stmt ?? null

      if (move.type === 'addHiddenPremise' && premiseRow.argument_id) {
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

  let targetOriginMoveId: number | null = null
  if (targetArgument) {
    // If the target statement is a premise revealed by addHiddenPremise, prefer that move as the origin
    if (targetStatement) {
      const [premRow] = await sql`
        SELECT id FROM premise WHERE statement_id = ${targetStatement.id} LIMIT 1
      `.catch(onError) as unknown as { id: number }[]
      if (premRow) {
        const [hpMove] = await sql`
          SELECT id FROM move
          WHERE premise_id = ${premRow.id}
            AND type = 'addHiddenPremise'
            AND id != ${moveId}
          ORDER BY id LIMIT 1
        `.catch(onError) as unknown as { id: number }[]
        if (hpMove) targetOriginMoveId = hpMove.id
      }
    }
    // Otherwise fall back to the move that created the target argument
    if (!targetOriginMoveId) {
      const [originMove] = await sql`
        SELECT id
        FROM move
        WHERE argument_id = ${targetArgument.id}
          AND id != ${moveId}
          AND claim_id = ${move.claim_id}
        ORDER BY id
        LIMIT 1
      `.catch(onError) as unknown as { id: number }[]
      targetOriginMoveId = originMove?.id ?? null
    }
  } else if (targetStatement && targetStatement.id !== move.claim_id) {
    const [premRow] = await sql`
      SELECT id, argument_id FROM premise WHERE statement_id = ${targetStatement.id} LIMIT 1
    `.catch(onError) as unknown as { id: number; argument_id: number }[]
    if (premRow) {
      // First check if this statement was revealed by an addHiddenPremise move
      const [hpMove] = await sql`
        SELECT id FROM move
        WHERE premise_id = ${premRow.id}
          AND type = 'addHiddenPremise'
          AND id != ${moveId}
        ORDER BY id LIMIT 1
      `.catch(onError) as unknown as { id: number }[]
      if (hpMove) {
        targetOriginMoveId = hpMove.id
      } else {
        // Fall back to the move that created the parent argument
        const [originMove] = await sql`
          SELECT id FROM move WHERE argument_id = ${premRow.argument_id} AND id != ${moveId} ORDER BY id LIMIT 1
        `.catch(onError) as unknown as { id: number }[]
        targetOriginMoveId = originMove?.id ?? null
      }
    }
  }

  // --- Compute response move IDs for each visible entity ---
  const responseMoveIds: Record<string, number[]> = {}

  // Collect statement IDs that appear in the view
  const stmtIds = new Set<number>()
  stmtIds.add(claimStatement.id)
  if (targetStatement && targetStatement.id !== move.claim_id) stmtIds.add(targetStatement.id)
  if (premiseStatement) stmtIds.add(premiseStatement.id)

  // For each statement: find moves that created arguments targeting it
  for (const sid of stmtIds) {
    // Step 1: find arguments that target this statement
    const args = await sql`
      SELECT id FROM argument WHERE claim_id = ${sid}
    `.catch(onError) as unknown as { id: number }[]
    if (args.length === 0) continue

    const argIdsForStmt = args.map(a => a.id)

    // Step 2: find moves that created those arguments
    const isMainClaim = sid === claimStatement.id
    const moves = await sql`
      SELECT id FROM move
      WHERE argument_id IN ${sql(argIdsForStmt)}
        ${isMainClaim ? sql`` : sql`AND id != ${moveId}`}
        AND claim_id = ${move.claim_id}
      ORDER BY id
    `.catch(onError) as unknown as { id: number }[]
    if (moves.length > 0) responseMoveIds[`s:${sid}`] = moves.map(r => r.id)
  }

  // Collect argument IDs that appear in the view
  const argIds = new Set<number>()
  if (targetArgument) argIds.add(targetArgument.id)
  if (argument) argIds.add(argument.id)

  // For each argument: find moves that respond to its premises
  for (const aid of argIds) {
    const responseIds = new Set<number>()

    // Step 1: find this argument's premises and their statement IDs
    const premises = await sql`
      SELECT id, statement_id FROM premise WHERE argument_id = ${aid}
    `.catch(onError) as unknown as { id: number; statement_id: number }[]

    if (premises.length > 0) {
      const premiseStmtIds = premises.map(p => p.statement_id)
      const premiseIds = premises.map(p => p.id)

      // Step 2: find arguments that target any of those premise statements
      const childArgs = await sql`
        SELECT id FROM argument WHERE claim_id IN ${sql(premiseStmtIds)}
      `.catch(onError) as unknown as { id: number }[]

      if (childArgs.length > 0) {
        // Step 3: find only addPremiseArgument moves (not addArgument which are deeper responses to the statement itself)
        const childArgIds = childArgs.map(a => a.id)
        const argMoves = await sql`
          SELECT id FROM move
          WHERE argument_id IN ${sql(childArgIds)}
            AND type = 'addPremiseArgument'
            AND id != ${moveId}
            AND claim_id = ${move.claim_id}
          ORDER BY id
        `.catch(onError) as unknown as { id: number }[]
        for (const m of argMoves) responseIds.add(m.id)
      }

      // Step 4: find addHiddenPremise moves for this argument's premises
      const hpMoves = await sql`
        SELECT id FROM move
        WHERE premise_id IN ${sql(premiseIds)}
          AND type = 'addHiddenPremise'
          AND id != ${moveId}
          AND claim_id = ${move.claim_id}
        ORDER BY id
      `.catch(onError) as unknown as { id: number }[]
      for (const m of hpMoves) responseIds.add(m.id)
    }

    if (responseIds.size > 0) responseMoveIds[`a:${aid}`] = [...responseIds].sort((a, b) => a - b)
  }

  res.json({ move, claimStatement, statement, argument, avatar, nav, targetStatement, targetArgument, targetArgumentClaim, targetOriginMoveId, responseMoveIds, premiseStatement } satisfies GetMoveResponse)
}