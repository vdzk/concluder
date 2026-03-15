import { type ScoreChanges } from "../../shared/types.ts"
import { onError, sql } from "./db.ts"

export const updateMoveLikelihood = async (
  moveId: number,
  claimId: number,
  scoreChanges: ScoreChanges
) => {
  const change = scoreChanges.statement[claimId]
  if (change) {
    await sql`
      UPDATE move
      SET claim_likelihood_before = ${change.old},
          claim_likelihood_after = ${change.new}
      WHERE id = ${moveId}
    `.catch(onError)
  } else {
    const [claim] = await sql`
      SELECT likelihood FROM statement WHERE id = ${claimId}
    `.catch(onError) as unknown as { likelihood: number }[]
    await sql`
      UPDATE move
      SET claim_likelihood_before = ${claim.likelihood},
          claim_likelihood_after = ${claim.likelihood}
      WHERE id = ${moveId}
    `.catch(onError)
  }
}
