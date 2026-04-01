import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { eq, desc, sql } from 'drizzle-orm'
import crypto from 'node:crypto'
import { db } from '../db/index.ts'
import { reasoningStepTable, userTable, userSessionTable, featuredTable, reasoningStepVersionTable, reasoningDependencyTable, definitionTable, adminTable } from '../db/schema.ts'
import type { Context } from './context.ts'
import { generateName } from '../lib/nameGenerator.ts'
import { annotateAnalysis, type AnnotationChunk } from '../lib/annotateAnalysis.ts'

const t = initTRPC.context<Context>().create()

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k.trim(), decodeURIComponent(v.join('='))]
    })
  );
}

const sessionMiddleware = t.middleware(async ({ ctx, next }) => {
  const cookies = parseCookies(ctx.req.headers.cookie);

  if (cookies.sessionKey) {
    const [session] = await db
      .select()
      .from(userSessionTable)
      .where(eq(userSessionTable.sessionKey, cookies.sessionKey))
      .limit(1)

    if (session) {
      return next({ ctx: { ...ctx, userId: session.userId } });
    }
  }

  // No valid session — create a new user and session
  const [user] = await db.insert(userTable).values({ name: generateName() }).returning();
  const sessionKey = crypto.randomUUID();
  await db.insert(userSessionTable).values({ userId: user.id, sessionKey });

  const sixMonths = 60 * 60 * 24 * 30 * 6;
  ctx.res.setHeader(
    'Set-Cookie',
    `sessionKey=${sessionKey}; Max-Age=${sixMonths}; Path=/; HttpOnly; SameSite=Lax`,
  );

  return next({ ctx: { ...ctx, userId: user.id } })
});

const sessionProcedure = t.procedure.use(sessionMiddleware)

const adminMiddleware = sessionMiddleware.unstable_pipe(async ({ ctx, next }) => {
  const [admin] = await db
    .select()
    .from(adminTable)
    .where(eq(adminTable.userId, ctx.userId))
    .limit(1);
  if (!admin) throw new Error('Forbidden');
  return next({ ctx });
});

const adminProcedure = t.procedure.use(adminMiddleware)

async function getStepById(id: number) {
  const [row] = await db
    .select({
      id: reasoningStepTable.id,
      question: reasoningStepTable.question,
      analysis: reasoningStepTable.analysis,
      annotatedAnalysis: reasoningStepTable.annotatedAnalysis,
      conclusion: reasoningStepTable.conclusion,
      createdBy: reasoningStepTable.createdBy,
      createdByName: userTable.name,
    })
    .from(reasoningStepTable)
    .innerJoin(userTable, eq(reasoningStepTable.createdBy, userTable.id))
    .where(eq(reasoningStepTable.id, id))
    .limit(1);
  return row ?? null;
}

async function refreshAnnotation(stepId: number) {
  const [step] = await db.select().from(reasoningStepTable).where(eq(reasoningStepTable.id, stepId)).limit(1);
  if (!step) return;

  const deps = await db
    .select({ id: reasoningStepTable.id, question: reasoningStepTable.question })
    .from(reasoningDependencyTable)
    .innerJoin(reasoningStepTable, eq(reasoningDependencyTable.targetId, reasoningStepTable.id))
    .where(eq(reasoningDependencyTable.sourceId, stepId));

  const chunks = await annotateAnalysis(step.question, step.analysis, deps);

  // Layer definition annotations on top
  const definitions = await db.select({ id: definitionTable.id, term: definitionTable.term }).from(definitionTable);
  const annotated = annotateDefinitions(chunks, definitions);

  await db.update(reasoningStepTable).set({ annotatedAnalysis: annotated }).where(eq(reasoningStepTable.id, stepId));
}

/**
 * Finds the first case-insensitive occurrence of each definition term in the chunks
 * and inserts a definition annotation. If the term falls inside a dependency link chunk,
 * the link is split so the definition portion gets its own chunk while the surrounding
 * text retains the original link.
 */
function annotateDefinitions(
  chunks: AnnotationChunk[],
  definitions: { id: number; term: string }[],
): AnnotationChunk[] {
  if (definitions.length === 0) return chunks;

  // Sort definitions longest-first so longer terms match before shorter substrings
  const sorted = [...definitions].sort((a, b) => b.term.length - a.term.length);
  const matched = new Set<number>();
  let result = [...chunks];

  for (const def of sorted) {
    // Build the full text to find the first occurrence across all chunks
    let offset = 0;
    let foundIdx = -1;
    let foundOffset = -1;

    const termLower = def.term.toLowerCase();

    for (let i = 0; i < result.length; i++) {
      const chunk = result[i];
      // Only search in text and link chunks (not already-placed definitions)
      if (chunk.type === 'definition') {
        offset += chunk.text.length;
        continue;
      }
      const idx = chunk.text.toLowerCase().indexOf(termLower);
      if (idx !== -1) {
        foundIdx = i;
        foundOffset = idx;
        break;
      }
      offset += chunk.text.length;
    }

    if (foundIdx === -1) continue;
    matched.add(def.id);

    const chunk = result[foundIdx];
    const matchEnd = foundOffset + def.term.length;
    const matchedText = chunk.text.slice(foundOffset, matchEnd);

    const replacement: AnnotationChunk[] = [];

    if (foundOffset > 0) {
      if (chunk.type === 'link') {
        replacement.push({ type: 'link', text: chunk.text.slice(0, foundOffset), dependencyId: chunk.dependencyId });
      } else {
        replacement.push({ type: 'text', text: chunk.text.slice(0, foundOffset) });
      }
    }

    replacement.push({ type: 'definition', text: matchedText, definitionId: def.id });

    if (matchEnd < chunk.text.length) {
      if (chunk.type === 'link') {
        replacement.push({ type: 'link', text: chunk.text.slice(matchEnd), dependencyId: chunk.dependencyId });
      } else {
        replacement.push({ type: 'text', text: chunk.text.slice(matchEnd) });
      }
    }

    result.splice(foundIdx, 1, ...replacement);
  }

  return result;
}

export const appRouter = t.router({
  reasoningStep: t.router({
    getById: t.procedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        return getStepById(input.id);
      }),

    update: sessionProcedure
      .input(z.object({
        id: z.number().int(),
        question: z.string().min(1),
        analysis: z.string().min(1),
        conclusion: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...fields } = input;

        const [current] = await db.select().from(reasoningStepTable).where(eq(reasoningStepTable.id, id)).limit(1);
        if (!current) throw new Error('Not found');

        const [latest] = await db
          .select({ version: reasoningStepVersionTable.version })
          .from(reasoningStepVersionTable)
          .where(eq(reasoningStepVersionTable.reasoningStepId, id))
          .orderBy(desc(reasoningStepVersionTable.version))
          .limit(1);

        await db.insert(reasoningStepVersionTable).values({
          reasoningStepId: id,
          version: (latest?.version ?? 0) + 1,
          question: current.question,
          analysis: current.analysis,
          conclusion: current.conclusion,
          editedBy: ctx.userId,
        });

        await db.update(reasoningStepTable).set(fields).where(eq(reasoningStepTable.id, id));
        await refreshAnnotation(id);
        return getStepById(id);
      }),

    versions: t.procedure
      .input(z.object({ reasoningStepId: z.number().int() }))
      .query(async ({ input }) => {
        return db
          .select({
            id: reasoningStepVersionTable.id,
            reasoningStepId: reasoningStepVersionTable.reasoningStepId,
            version: reasoningStepVersionTable.version,
            question: reasoningStepVersionTable.question,
            analysis: reasoningStepVersionTable.analysis,
            conclusion: reasoningStepVersionTable.conclusion,
            editedBy: reasoningStepVersionTable.editedBy,
            editedAt: reasoningStepVersionTable.editedAt,
            editedByName: userTable.name,
          })
          .from(reasoningStepVersionTable)
          .innerJoin(userTable, eq(reasoningStepVersionTable.editedBy, userTable.id))
          .where(eq(reasoningStepVersionTable.reasoningStepId, input.reasoningStepId))
          .orderBy(desc(reasoningStepVersionTable.version));
      }),

    rollback: adminProcedure
      .input(z.object({ versionId: z.number().int() }))
      .mutation(async ({ input, ctx }) => {
        const [ver] = await db.select().from(reasoningStepVersionTable).where(eq(reasoningStepVersionTable.id, input.versionId)).limit(1);
        if (!ver) throw new Error('Version not found');

        const [current] = await db.select().from(reasoningStepTable).where(eq(reasoningStepTable.id, ver.reasoningStepId)).limit(1);
        if (!current) throw new Error('Not found');

        const [latest] = await db
          .select({ version: reasoningStepVersionTable.version })
          .from(reasoningStepVersionTable)
          .where(eq(reasoningStepVersionTable.reasoningStepId, ver.reasoningStepId))
          .orderBy(desc(reasoningStepVersionTable.version))
          .limit(1);

        await db.insert(reasoningStepVersionTable).values({
          reasoningStepId: ver.reasoningStepId,
          version: (latest?.version ?? 0) + 1,
          question: current.question,
          analysis: current.analysis,
          conclusion: current.conclusion,
          editedBy: ctx.userId,
        });

        await db.update(reasoningStepTable).set({
          question: ver.question,
          analysis: ver.analysis,
          conclusion: ver.conclusion,
        }).where(eq(reasoningStepTable.id, ver.reasoningStepId));
        await refreshAnnotation(ver.reasoningStepId);
        return getStepById(ver.reasoningStepId);
      }),

    create: sessionProcedure
      .input(z.object({
        question: z.string().min(1),
        analysis: z.string().min(1),
        conclusion: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const [row] = await db.insert(reasoningStepTable).values({
          ...input,
          createdBy: ctx.userId,
        }).returning();
        return row;
      }),

    dependencies: t.procedure
      .input(z.object({ reasoningStepId: z.number().int() }))
      .query(async ({ input }) => {
        return db
          .select({
            id: reasoningStepTable.id,
            question: reasoningStepTable.question,
            conclusion: reasoningStepTable.conclusion,
          })
          .from(reasoningDependencyTable)
          .innerJoin(reasoningStepTable, eq(reasoningDependencyTable.targetId, reasoningStepTable.id))
          .where(eq(reasoningDependencyTable.sourceId, input.reasoningStepId));
      }),

    dependents: t.procedure
      .input(z.object({ reasoningStepId: z.number().int() }))
      .query(async ({ input }) => {
        return db
          .select({
            id: reasoningStepTable.id,
            question: reasoningStepTable.question,
            conclusion: reasoningStepTable.conclusion,
          })
          .from(reasoningDependencyTable)
          .innerJoin(reasoningStepTable, eq(reasoningDependencyTable.sourceId, reasoningStepTable.id))
          .where(eq(reasoningDependencyTable.targetId, input.reasoningStepId));
      }),

    breadcrumbs: t.procedure
      .input(z.object({ reasoningStepId: z.number().int() }))
      .query(async ({ input }) => {
        const chain: { id: number; question: string }[] = [];
        let currentId = input.reasoningStepId;
        const visited = new Set<number>();
        while (true) {
          visited.add(currentId);
          const parents = await db
            .select({
              id: reasoningStepTable.id,
              question: reasoningStepTable.question,
            })
            .from(reasoningDependencyTable)
            .innerJoin(reasoningStepTable, eq(reasoningDependencyTable.sourceId, reasoningStepTable.id))
            .where(eq(reasoningDependencyTable.targetId, currentId));
          if (parents.length === 0) break;
          const parent = parents[0];
          if (visited.has(parent.id)) break;
          chain.push(parent);
          currentId = parent.id;
        }
        return chain.reverse();
      }),

    addDependency: sessionProcedure
      .input(z.object({
        sourceId: z.number().int(),
        question: z.string().min(1),
        analysis: z.string().min(1),
        conclusion: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { sourceId, ...fields } = input;
        const [step] = await db.insert(reasoningStepTable).values({
          ...fields,
          createdBy: ctx.userId,
        }).returning();
        await db.insert(reasoningDependencyTable).values({
          sourceId,
          targetId: step.id,
          createdBy: ctx.userId,
        });
        await refreshAnnotation(sourceId);
        return step;
      }),
  }),

  user: t.router({
    isAdmin: sessionProcedure.query(async ({ ctx }) => {
      const [admin] = await db
        .select()
        .from(adminTable)
        .where(eq(adminTable.userId, ctx.userId))
        .limit(1);
      return { isAdmin: !!admin };
    }),
  }),

  recent: t.router({
    list: t.procedure.query(async () => {
      // For each step, find the latest version edit (if any)
      const latestVersion = db
        .select({
          reasoningStepId: reasoningStepVersionTable.reasoningStepId,
          editedAt: sql<Date>`max(${reasoningStepVersionTable.editedAt})`.as('latest_edited_at'),
        })
        .from(reasoningStepVersionTable)
        .groupBy(reasoningStepVersionTable.reasoningStepId)
        .as('lv');

      // Get steps ordered by most recent activity (edit or creation)
      const rows = await db
        .select({
          id: reasoningStepTable.id,
          question: reasoningStepTable.question,
          createdAt: reasoningStepTable.createdAt,
          lastEditedAt: latestVersion.editedAt,
          createdByName: userTable.name,
        })
        .from(reasoningStepTable)
        .innerJoin(userTable, eq(reasoningStepTable.createdBy, userTable.id))
        .leftJoin(latestVersion, eq(reasoningStepTable.id, latestVersion.reasoningStepId))
        .orderBy(sql`coalesce(${latestVersion.editedAt}, ${reasoningStepTable.createdAt}) desc`)
        .limit(30);

      // For steps that have been edited, also fetch who made the latest edit
      const stepsWithEdits = rows.filter(r => r.lastEditedAt !== null);
      const editedByMap = new Map<number, string>();
      if (stepsWithEdits.length > 0) {
        for (const step of stepsWithEdits) {
          const [ver] = await db
            .select({ editedByName: userTable.name })
            .from(reasoningStepVersionTable)
            .innerJoin(userTable, eq(reasoningStepVersionTable.editedBy, userTable.id))
            .where(eq(reasoningStepVersionTable.reasoningStepId, step.id))
            .orderBy(desc(reasoningStepVersionTable.version))
            .limit(1);
          if (ver) editedByMap.set(step.id, ver.editedByName);
        }
      }

      return rows.map(r => {
        const ts = r.lastEditedAt ?? r.createdAt;
        return {
          id: r.id,
          question: r.question,
          activityAt: new Date(ts).toISOString(),
          wasEdited: r.lastEditedAt !== null,
          actorName: r.lastEditedAt !== null
            ? (editedByMap.get(r.id) ?? r.createdByName)
            : r.createdByName,
        };
      });
    }),
  }),

  featured: t.router({
    list: t.procedure.query(async () => {
      const rows = await db
        .select({
          id: reasoningStepTable.id,
          question: reasoningStepTable.question,
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
  }),

  definition: t.router({
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
  }),
});

export type AppRouter = typeof appRouter;
