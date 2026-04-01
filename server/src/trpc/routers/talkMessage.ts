import { z } from 'zod'
import { eq, asc, desc } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { reasoningStepMessageTable, reasoningStepTable, userTable } from '../../db/schema.ts'
import { t, sessionProcedure } from '../trpc.ts'

export const talkMessageRouter = t.router({
  recent: t.procedure.query(async () => {
    return db
      .select({
        id: reasoningStepMessageTable.id,
        body: reasoningStepMessageTable.body,
        createdAt: reasoningStepMessageTable.createdAt,
        userName: userTable.name,
        reasoningStepId: reasoningStepMessageTable.reasoningStepId,
        stepQuestion: reasoningStepTable.question,
      })
      .from(reasoningStepMessageTable)
      .innerJoin(userTable, eq(reasoningStepMessageTable.userId, userTable.id))
      .innerJoin(reasoningStepTable, eq(reasoningStepMessageTable.reasoningStepId, reasoningStepTable.id))
      .orderBy(desc(reasoningStepMessageTable.createdAt))
      .limit(30);
  }),

  list: t.procedure
    .input(z.object({ reasoningStepId: z.number().int() }))
    .query(async ({ input }) => {
      return db
        .select({
          id: reasoningStepMessageTable.id,
          body: reasoningStepMessageTable.body,
          createdAt: reasoningStepMessageTable.createdAt,
          userId: reasoningStepMessageTable.userId,
          userName: userTable.name,
        })
        .from(reasoningStepMessageTable)
        .innerJoin(userTable, eq(reasoningStepMessageTable.userId, userTable.id))
        .where(eq(reasoningStepMessageTable.reasoningStepId, input.reasoningStepId))
        .orderBy(asc(reasoningStepMessageTable.createdAt));
    }),

  send: sessionProcedure
    .input(z.object({
      reasoningStepId: z.number().int(),
      body: z.string().min(1).max(10000),
    }))
    .mutation(async ({ input, ctx }) => {
      const [msg] = await db
        .insert(reasoningStepMessageTable)
        .values({
          reasoningStepId: input.reasoningStepId,
          userId: ctx.userId,
          body: input.body,
        })
        .returning();
      const [withUser] = await db
        .select({
          id: reasoningStepMessageTable.id,
          body: reasoningStepMessageTable.body,
          createdAt: reasoningStepMessageTable.createdAt,
          userId: reasoningStepMessageTable.userId,
          userName: userTable.name,
        })
        .from(reasoningStepMessageTable)
        .innerJoin(userTable, eq(reasoningStepMessageTable.userId, userTable.id))
        .where(eq(reasoningStepMessageTable.id, msg.id))
        .limit(1);
      return withUser;
    }),
})
