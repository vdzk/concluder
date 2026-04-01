import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { definitionTable } from '../../db/schema.ts'
import { t, sessionProcedure } from '../trpc.ts'

export const definitionRouter = t.router({
  list: t.procedure.query(async () => {
    return db
      .select({ id: definitionTable.id, term: definitionTable.term, text: definitionTable.text })
      .from(definitionTable)
      .orderBy(definitionTable.term);
  }),

  getById: t.procedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const [row] = await db
        .select({ id: definitionTable.id, term: definitionTable.term, text: definitionTable.text })
        .from(definitionTable)
        .where(eq(definitionTable.id, input.id))
        .limit(1);
      return row ?? null;
    }),

  create: sessionProcedure
    .input(z.object({
      term: z.string().min(1),
      text: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const [row] = await db.insert(definitionTable).values({
        ...input,
        createdBy: ctx.userId,
      }).returning();
      return row;
    }),
});
