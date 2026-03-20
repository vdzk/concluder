import { type RequestHandler } from 'express'
import { onError, sql } from '../db.ts'

export const getClaimIdByDescendant: RequestHandler = async (req, res) => {
  const { argumentId } = req.body

  let currentArgumentId: number = argumentId
  const visited = new Set<number>()

  while (true) {
    if (visited.has(currentArgumentId)) {
      res.status(400).json({ error: 'Cycle detected in argument tree' })
      return
    }
    visited.add(currentArgumentId)

    const [argument] = await sql`
      SELECT claim_id FROM argument WHERE id = ${currentArgumentId}
    `.catch(onError)

    if (!argument) {
      res.status(404).json({ error: 'Argument not found' })
      return
    }

    const statementId: number = argument.claim_id

    const [exposed] = await sql`
      SELECT claim_id FROM exposed WHERE claim_id = ${statementId}
    `.catch(onError)

    if (exposed) {
      res.json({ claimId: statementId })
      return
    }

    const [premise] = await sql`
      SELECT argument_id FROM premise WHERE statement_id = ${statementId}
    `.catch(onError)

    if (!premise) {
      res.status(404).json({ error: 'Could not find an exposed ancestor claim' })
      return
    }

    currentArgumentId = premise.argument_id
  }
}
