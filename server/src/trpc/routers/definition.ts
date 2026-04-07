import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { definitionTable, definitionVersionTable, userTable } from '../../db/schema.ts'
import { t, sessionProcedure } from '../trpc.ts'
import { generateDefinitionChangeSummary } from '../../lib/generateDefinitionChangeSummary.ts'

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
        .select({
          id: definitionTable.id,
          term: definitionTable.term,
          text: definitionTable.text,
          changeSummary: definitionTable.changeSummary,
          createdBy: definitionTable.createdBy,
          createdByName: userTable.name,
          createdAt: definitionTable.createdAt,
        })
        .from(definitionTable)
        .innerJoin(userTable, eq(definitionTable.createdBy, userTable.id))
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
      const changeSummary = await generateDefinitionChangeSummary(input, null);
      const [row] = await db.insert(definitionTable).values({
        ...input,
        changeSummary,
        createdBy: ctx.userId,
      }).returning();
      return row;
    }),

  update: sessionProcedure
    .input(z.object({
      id: z.number().int(),
      term: z.string().min(1),
      text: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...fields } = input;

      const [current] = await db.select().from(definitionTable).where(eq(definitionTable.id, id)).limit(1);
      if (!current) throw new Error('Not found');

      const [latest] = await db
        .select({ version: definitionVersionTable.version })
        .from(definitionVersionTable)
        .where(eq(definitionVersionTable.definitionId, id))
        .orderBy(desc(definitionVersionTable.version))
        .limit(1);

      await db.insert(definitionVersionTable).values({
        definitionId: id,
        version: (latest?.version ?? 0) + 1,
        term: current.term,
        text: current.text,
        changeSummary: current.changeSummary,
        createdBy: current.createdBy,
      });

      const changeSummary = await generateDefinitionChangeSummary(fields, {
        term: current.term,
        text: current.text,
      });

      await db.update(definitionTable).set({
        ...fields,
        changeSummary,
        createdBy: ctx.userId,
      }).where(eq(definitionTable.id, id));

      const [updated] = await db
        .select({
          id: definitionTable.id,
          term: definitionTable.term,
          text: definitionTable.text,
          changeSummary: definitionTable.changeSummary,
          createdBy: definitionTable.createdBy,
          createdByName: userTable.name,
          createdAt: definitionTable.createdAt,
        })
        .from(definitionTable)
        .innerJoin(userTable, eq(definitionTable.createdBy, userTable.id))
        .where(eq(definitionTable.id, id))
        .limit(1);
      return updated;
    }),

  versions: t.procedure
    .input(z.object({ definitionId: z.number().int() }))
    .query(async ({ input }) => {
      return db
        .select({
          id: definitionVersionTable.id,
          definitionId: definitionVersionTable.definitionId,
          version: definitionVersionTable.version,
          term: definitionVersionTable.term,
          text: definitionVersionTable.text,
          changeSummary: definitionVersionTable.changeSummary,
          createdBy: definitionVersionTable.createdBy,
          createdAt: definitionVersionTable.createdAt,
          createdByName: userTable.name,
        })
        .from(definitionVersionTable)
        .innerJoin(userTable, eq(definitionVersionTable.createdBy, userTable.id))
        .where(eq(definitionVersionTable.definitionId, input.definitionId))
        .orderBy(desc(definitionVersionTable.version));
    }),
});
