import { calcArgumentStrength, type Premise } from "./argumentStrength.ts"
import { onError, sql } from "./db.ts"
import { calcStatementConfidence } from "./statementConfidence.ts"
import { type ScoreChanges } from "../../shared/types.ts"

type PremiseDataRow = Premise & { argument_id: number, statement_id: number }

export const cascadeUpdateScores = async (
  claimId: number,
  newClaim?: boolean,
  willDelete?: boolean
) => {
  const scoreChanges: ScoreChanges = {
    statement: {},
    argument: {}
  }

  if (!newClaim) {
    // update the likelihood of the claim
    const siblingArguments = await sql`
      SELECT id, pro, strength, consequence.wtp
      FROM argument
      LEFT JOIN consequence ON consequence.argument_id = argument.id
      WHERE claim_id = ${claimId}
    `.catch(onError)

    let newClaimLikelihood
    const isPrescriptive = siblingArguments.some(a => !!a.wtp)
    if (isPrescriptive) {
      const weightedSums = [0, 0]
      for (const argument of siblingArguments) {
        const side = Number(argument.pro)
        // If wtp is negative assume that the argument is for prevention of a negative consequence
        const wtp = Math.abs((argument.wtp ?? 0))
        const expectedValue = wtp * argument.strength
        weightedSums[side] += expectedValue
      }
      const totalWeight = weightedSums[0] + weightedSums[1]
      if (totalWeight === 0) {
        newClaimLikelihood = 0.5
      } else {
        newClaimLikelihood = weightedSums[1] / totalWeight
      }
    } else {
      const strengths: [number[], number[]] = [[], []]
      for (const argument of siblingArguments) {
        const side = Number(argument.pro)
        strengths[side].push(argument.strength)
      }
      newClaimLikelihood = calcStatementConfidence(strengths)
    }




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
  }

  // update parent argument strength
  const siblingPremises = await sql<PremiseDataRow[]>`
    SELECT DISTINCT
      sibling_premise.statement_id,
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
    const parentArguments: Record<number, PremiseDataRow[]> = {}
    for (const premise of siblingPremises) {
      if (!parentArguments[premise.argument_id]) {
        parentArguments[premise.argument_id] = []
      }
      parentArguments[premise.argument_id].push(premise)
    }
    const newParentArgumentStrengths: [number, number][] = []
    for (const parentArgumentId in parentArguments) {
      const premises = parentArguments[parentArgumentId]
      if (willDelete && premises.length === 1 && premises[0].statement_id === claimId) {
        // This is the premise that we will delete.
        // It was temporarily set to 100% so that it can be ignored by its siblings.
        // But in this case, having no siblings this shortcut breaks the calculations.
        continue
      }
      newParentArgumentStrengths.push([
        parseInt(parentArgumentId),
        calcArgumentStrength(premises)
      ])
    }

    if (newParentArgumentStrengths.length > 0) {
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
          [...parentClaimIds].map(parentClaimId => cascadeUpdateScores(parentClaimId))
        )
        for (const diffs of parentScoreChanges) {
          Object.assign(scoreChanges.statement, diffs.statement)
          Object.assign(scoreChanges.argument, diffs.argument)
        }
      }
    }
  }

  return scoreChanges
}