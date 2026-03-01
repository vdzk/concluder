import { onError, sql } from "./db.ts"
import { countries } from "../../shared/constants.ts"
import { analyseConsequence, parseConsequence } from "./analyse/consequence.ts"
import { cascadeUpdateScores } from "./cascadeUpdateScores.ts"

export const processNewArgument = async (
  claimId: number,
  argumentId: number,
  argumentText: string,
  pro: boolean
) => {
  const claimResults = await sql`
    SELECT statement.text, national.country_code
    FROM statement
    JOIN national ON national.statement_id = ${claimId}
    JOIN prescriptive ON prescriptive.statement_id = ${claimId}
    WHERE statement.id = ${claimId}
  `.catch(onError)

  if (claimResults.length === 0) return

  const claimResult = claimResults[0]

  let stakeholders = ''
  if (claimResult.country_code === 'other') {
    const stakeholderResults = await sql`
      SELECT group_name
      FROM stakeholders
      WHERE statement_id = ${claimId}
    `.catch(onError)
    if (stakeholderResults.length === 0) return
    stakeholders = stakeholderResults[0].group_name
  } else {
    stakeholders = `citizens of ${countries[claimResult.country_code]}`
  }

  const outcome = await parseConsequence(
    stakeholders, claimResult.text, argumentText, pro
  )

  if (!outcome) return

  const { derivation, wtp } = await analyseConsequence(
    stakeholders, outcome, pro
  )

  await sql`
    DELETE FROM consequence
    WHERE argument_id = ${argumentId}
  `.catch(onError)

  await sql`
    INSERT INTO consequence ${sql({
      argument_id: argumentId,
      outcome, wtp, derivation
    })}
  `.catch(onError)

  cascadeUpdateScores(claimId)
}