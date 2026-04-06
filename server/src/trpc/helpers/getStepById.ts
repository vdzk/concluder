import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { reasoningStepTable, userTable } from '../../db/schema.ts'

export async function getStepById(id: number) {
  const [row] = await db
    .select({
      id: reasoningStepTable.id,
      question: reasoningStepTable.question,
      analysis: reasoningStepTable.analysis,
      annotatedAnalysis: reasoningStepTable.annotatedAnalysis,
      conclusion: reasoningStepTable.conclusion,
      createdBy: reasoningStepTable.createdBy,
      createdByName: userTable.name,
      createdAt: reasoningStepTable.createdAt,
    })
    .from(reasoningStepTable)
    .innerJoin(userTable, eq(reasoningStepTable.createdBy, userTable.id))
    .where(eq(reasoningStepTable.id, id))
    .limit(1);
  return row ?? null;
}
