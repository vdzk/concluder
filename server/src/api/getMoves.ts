import { type RequestHandler } from "express"
import { type Row } from "postgres"
import { onError, sql } from "../db.ts"

export const getMoves: RequestHandler = async (req, res) => {
  const claimId = req.body.id
  const moveResults: Row[] = await sql`
    SELECT move.id, type, statement_id, argument_id, target_id,
      avatar.id as avatar_id
    FROM move
    JOIN avatar
      ON avatar.owner = move.owner
    WHERE claim_id = ${claimId}
    ORDER BY move.id
  `.catch(onError)

  const statementIds = [];
  const argumentIds = [];
  const avatarIds = [];

  for (const move of moveResults) {
    if (move.statement_id) statementIds.push(move.statement_id)
    if (move.argument_id) argumentIds.push(move.argument_id)
    if (move.avatar_id) avatarIds.push(move.avatar_id)
  }

  let statementResults: Row[] = []
  if (statementIds.length > 0) {
    statementResults = await sql`
      SELECT id, text, likelihood
      FROM statement
      WHERE id IN ${sql(statementIds)}
    `.catch(onError)
  }

  let argumentResults: Row[] = []
  if (argumentIds.length > 0) {
    argumentResults = await sql`
      SELECT id, claim_id, text, pro, strength
      FROM argument
      WHERE id IN ${sql(argumentIds)}
    `.catch(onError)
  }

  let avatarResults: Row[] = []
  if (avatarIds.length > 0) {
    avatarResults = await sql`
      SELECT id, svg, display_name
      FROM avatar
      WHERE id IN ${sql(avatarIds)}
    `.catch(onError)
  }

  res.json({
    moves: moveResults,
    statements: statementResults,
    arguments: argumentResults,
    avatars: avatarResults
  })
}