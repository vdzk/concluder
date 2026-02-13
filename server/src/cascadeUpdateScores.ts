import { calcArgumentStrength, type Premise } from "./argumentStrength.ts"
import { onError, sql } from "./db.ts"
import { calcStatementConfidence } from "./statementConfidence.ts"
import { type ScoreChanges } from "../../shared/types.ts"

export const cascadeUpdateScores = async (
  claimId: number
) => {
  const scoreChanges: ScoreChanges = {
    statement: {},
    argument: {}
  }

  // update the likelihood of the claim
  const siblingArguments = await sql`
    SELECT id, pro, strength
    FROM argument
    WHERE claim_id = ${claimId}
  `.catch(onError)

  const strengths: [number[], number[]] = [[], []]
  for (const argument of siblingArguments) {
    const side = Number(argument.pro)
    strengths[side].push(argument.strength)
  }
  const newClaimLikelihood = calcStatementConfidence(strengths)

  const claimResults = await sql`
    WITH old AS (
      SELECT id, likelihood
      FROM statement
      WHERE id = ${claimId}
    )
    UPDATE statement
    SET likelihood = ${newClaimLikelihood}
    FROM old
    WHERE statement.id = old.id
    RETURNING old.likelihood  AS old_likelihood
  `.catch(onError)
  const oldClaimLikelihood = claimResults[0].old_likelihood

  const deltaLikelihoodIsSignificant = Math.abs(oldClaimLikelihood - newClaimLikelihood) > 0.001

  if (!deltaLikelihoodIsSignificant) return scoreChanges

  scoreChanges.statement[claimId] = {
    old: oldClaimLikelihood,
    new: newClaimLikelihood
  }

  // update parent argument strength
  const siblingPremises = await sql<(Premise & {argument_id: number})[]>`
    SELECT DISTINCT
      sibling_premise.argument_id,
      sibling_premise.invert,
      statement.likelihood
    FROM premise own_premise
    JOIN premise sibling_premise
      ON sibling_premise.argument_id = own_premise.argument_id
    JOIN statement
      ON statement.id = sibling_premise.statement_id
    WHERE own_premise.statement_id = ${claimId}
  `.catch(onError)

  if (siblingPremises.length > 0) {
    const parentArguments: Record<number, Premise[]> = {}
    for (const premise of siblingPremises) {
      if (!parentArguments[premise.argument_id]) {
        parentArguments[premise.argument_id] = []
      }
      parentArguments[premise.argument_id].push(premise)
    }
    const newParentArgumentStrengths: [number, number][] = []
    for (const parentArgumentId in parentArguments) {
      newParentArgumentStrengths.push([
        parseInt(parentArgumentId),
        calcArgumentStrength(parentArguments[parentArgumentId])
      ])
    }

    const parentArgumentDiffs = await sql`
      UPDATE argument AS argument_new
      SET strength = update_data.strength::real
      FROM (
        VALUES ${sql(newParentArgumentStrengths)}
      ) AS update_data(argument_id, strength)
      JOIN argument AS argument_old
        ON argument_old.id = update_data.argument_id::int
      WHERE argument_new.id = update_data.argument_id::int
      RETURNING
        update_data.argument_id,
        argument_old.strength AS old_strength,
        argument_new.strength AS new_strength
    `.catch(onError)

    for (const diff of parentArgumentDiffs) {
      scoreChanges.argument[diff.argument_id] = {
        old: diff.old_strength,
        new: diff.new_strength
      }
    }

    // cascade updates
    const parentArgumentResults = await sql`
      SELECT DISTINCT argument.claim_id
      FROM argument
      JOIN premise
        ON premise.argument_id = argument.id
      WHERE premise.statement_id = ${claimId}
    `.catch(onError)
    if (parentArgumentResults.length > 0) {
      const parentClaimIds = parentArgumentResults.map(argument => argument.claim_id)
      const parentScoreChanges = await Promise.all(
        [...parentClaimIds].map(cascadeUpdateScores)
      )
      for (const diffs of parentScoreChanges) {
        Object.assign(scoreChanges.statement, diffs.statement)
        Object.assign(scoreChanges.argument, diffs.argument)
      }
    }
  }
  
  return scoreChanges
}