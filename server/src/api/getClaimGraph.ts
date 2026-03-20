import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'

export const getClaimGraph: RequestHandler = async (req, res) => {
  const statementsById: Record<number, any> = {}
  const argumentsById: Record<number, any> = {}
  const commentsById: Record<number, any> = {}

  const edges: {
    hasArgument: Record<number, number[]>
    hasPremise: Record<number, number[]>
    statementHasComment: Record<number, number[]>
    argumentHasComment: Record<number, number[]>
  } = {
    hasArgument: {},
    hasPremise: {},
    statementHasComment: {},
    argumentHasComment: {},
  }

  // Seed with the main claim
  let statementIdsToProcess = [req.body.claimId as number]

  while (statementIdsToProcess.length > 0) {
    // Fetch statements for this layer
    const statements = await sql`
      SELECT id, text, likelihood
      FROM statement
      WHERE id = ANY(${statementIdsToProcess})
    `.catch(onError)

    for (const s of statements) {
      statementsById[s.id] = s
    }

    // Fetch comments attached to these statements
    const stmtComments = await sql`
      SELECT id, text, statement_id
      FROM comment
      WHERE statement_id = ANY(${statementIdsToProcess})
    `.catch(onError)

    for (const c of stmtComments) {
      commentsById[c.id] = { id: c.id, text: c.text }
      if (!edges.statementHasComment[c.statement_id]) edges.statementHasComment[c.statement_id] = []
      edges.statementHasComment[c.statement_id].push(c.id)
    }

    // Fetch arguments for these statements
    const arguments_ = await sql`
      SELECT id, claim_id, text, pro, strength
      FROM argument
      WHERE claim_id = ANY(${statementIdsToProcess})
    `.catch(onError)

    if (arguments_.length === 0) break

    const argumentIds: number[] = []
    for (const a of arguments_) {
      argumentsById[a.id] = a
      argumentIds.push(a.id)
      const claimId = a.claim_id
      if (!edges.hasArgument[claimId]) edges.hasArgument[claimId] = []
      edges.hasArgument[claimId].push(a.id)
    }

    // Fetch premises for these arguments
    const premises = await sql`
      SELECT argument_id, statement_id
      FROM premise
      WHERE argument_id = ANY(${argumentIds})
    `.catch(onError)

    statementIdsToProcess = []
    for (const p of premises) {
      if (!edges.hasPremise[p.argument_id]) edges.hasPremise[p.argument_id] = []
      edges.hasPremise[p.argument_id].push(p.statement_id)
      if (!(p.statement_id in statementsById)) {
        statementIdsToProcess.push(p.statement_id)
      }
    }

    // Fetch comments attached to these arguments
    const argComments = await sql`
      SELECT id, text, argument_id
      FROM comment
      WHERE argument_id = ANY(${argumentIds})
    `.catch(onError)

    for (const c of argComments) {
      commentsById[c.id] = { id: c.id, text: c.text }
      if (!edges.argumentHasComment[c.argument_id]) edges.argumentHasComment[c.argument_id] = []
      edges.argumentHasComment[c.argument_id].push(c.id)
    }
  }

  res.json({ statementsById, argumentsById, commentsById, edges })
}
