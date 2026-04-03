import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { reasoningStepTable, featuredTable } from '../../db/schema.ts'
import { t, sessionProcedure } from '../trpc.ts'

export const featuredRouter = t.router({
  list: t.procedure.query(async () => {
    const rows = await db
      .select({
        id: reasoningStepTable.id,
        question: reasoningStepTable.question,
        conclusion: reasoningStepTable.conclusion,
      })
      .from(featuredTable)
      .innerJoin(reasoningStepTable, eq(reasoningStepTable.id, featuredTable.id));
    return rows;
  }),

  submit: sessionProcedure
    .input(z.object({ question: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const [step] = await db.insert(reasoningStepTable).values({
        question: input.question,
        analysis: 'Pending analysis.',
        conclusion: 'Pending conclusion.',
        createdBy: ctx.userId,
      }).returning();
      await db.insert(featuredTable).values({ id: step.id });
      return step;
    }),
});
