import { type ScoreChanges } from "../../shared/types.ts";
import { onError, sql } from "./db.ts";

export const saveScoreChange = async (
  scoreChanges: ScoreChanges,
  owner: string,
  actionData: any
) => {
  const statementIds = Object.keys(scoreChanges.statement)
  if (statementIds.length === 0) return
  const taggedResults = await sql`
    SELECT statement_id
    FROM tagged
    WHERE statement_id IN ${sql(statementIds)}
  `.catch(onError)
  if (taggedResults.length === 0) return
  const newRows = taggedResults.map(tagged => ({
    claim_id: tagged.statement_id,
    old: scoreChanges.statement[tagged.statement_id].old,
    new: scoreChanges.statement[tagged.statement_id].new,
    owner,
    action_data: actionData
  }))
  await sql`
    INSERT INTO score_change ${sql(newRows)}
  `.catch(onError)

}