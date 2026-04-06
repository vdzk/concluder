import { z } from 'zod'
import { eq, desc, and } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { reasoningStepTable, reasoningStepVersionTable, reasoningDependencyTable, userTable, featuredTable } from '../../db/schema.ts'
import { type AnnotationChunk } from '../../lib/annotateAnalysis.ts'
import { t, sessionProcedure, adminProcedure } from '../trpc.ts'
import { getStepById } from '../helpers/getStepById.ts'
import { extractLinks, buildChunksFromLinks, stripDefinitions, preserveLinks, addLinkToChunks, removeLinkAtSelection } from '../helpers/links.ts'
import { applyDefinitions } from '../helpers/definitions.ts'
import { updateFeaturedConclusion } from '../helpers/updateFeaturedConclusion.ts'
import { generateFeaturedConclusion } from '../../lib/generateFeaturedConclusion.ts'

export const reasoningStepRouter = t.router({
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
        annotatedAnalysis: current.annotatedAnalysis,
        conclusion: current.conclusion,
        createdBy: current.createdBy,
      });

      const oldChunks = (current.annotatedAnalysis as AnnotationChunk[] | null) ?? [];
      let newChunks: AnnotationChunk[];
      if (fields.analysis !== current.analysis) {
        newChunks = preserveLinks(current.analysis, fields.analysis, oldChunks);
      } else {
        newChunks = stripDefinitions(oldChunks);
      }
      newChunks = await applyDefinitions(newChunks);

      await db.update(reasoningStepTable).set({ ...fields, annotatedAnalysis: newChunks, createdBy: ctx.userId }).where(eq(reasoningStepTable.id, id));

      if (fields.question !== current.question || fields.conclusion !== current.conclusion) {
        await updateFeaturedConclusion(id, fields.question, fields.conclusion);
      }

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
          createdBy: reasoningStepVersionTable.createdBy,
          createdAt: reasoningStepVersionTable.createdAt,
          createdByName: userTable.name,
        })
        .from(reasoningStepVersionTable)
        .innerJoin(userTable, eq(reasoningStepVersionTable.createdBy, userTable.id))
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
        annotatedAnalysis: current.annotatedAnalysis,
        conclusion: current.conclusion,
        createdBy: current.createdBy,
      });

      const oldChunks = (ver.annotatedAnalysis as AnnotationChunk[] | null) ?? [];
      const linkChunks = stripDefinitions(oldChunks);
      const newChunks = await applyDefinitions(linkChunks);

      await db.update(reasoningStepTable).set({
        question: ver.question,
        analysis: ver.analysis,
        conclusion: ver.conclusion,
        annotatedAnalysis: newChunks,
        createdBy: ver.createdBy,
      }).where(eq(reasoningStepTable.id, ver.reasoningStepId));

      if (ver.question !== current.question || ver.conclusion !== current.conclusion) {
        await updateFeaturedConclusion(ver.reasoningStepId, ver.question, ver.conclusion);
      }

      return getStepById(ver.reasoningStepId);
    }),

  create: sessionProcedure
    .input(z.object({
      question: z.string().min(1),
      analysis: z.string().min(1),
      conclusion: z.string().min(1),
      featured: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { featured, ...fields } = input;
      const annotatedAnalysis = await applyDefinitions([{ type: 'text', text: fields.analysis }]);
      const [row] = await db.insert(reasoningStepTable).values({
        ...fields,
        annotatedAnalysis,
        createdBy: ctx.userId,
      }).returning();
      if (featured) {
        const conclusion = await generateFeaturedConclusion(row.question, row.conclusion, null);
        await db.insert(featuredTable).values({ id: row.id, conclusion });
      }
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
      const annotatedAnalysis = await applyDefinitions([{ type: 'text', text: fields.analysis }]);
      const [step] = await db.insert(reasoningStepTable).values({
        ...fields,
        annotatedAnalysis,
        createdBy: ctx.userId,
      }).returning();
      await db.insert(reasoningDependencyTable).values({
        sourceId,
        targetId: step.id,
        createdBy: ctx.userId,
      });
      return step;
    }),

  linkAnnotation: sessionProcedure
    .input(z.object({
      stepId: z.number().int(),
      dependencyId: z.number().int(),
      startOffset: z.number().int().min(0),
      endOffset: z.number().int().min(1),
    }))
    .mutation(async ({ input }) => {
      const [step] = await db.select().from(reasoningStepTable).where(eq(reasoningStepTable.id, input.stepId)).limit(1);
      if (!step) throw new Error('Not found');

      if (input.startOffset >= input.endOffset || input.endOffset > step.analysis.length) {
        throw new Error('Invalid selection range');
      }

      const [dep] = await db
        .select()
        .from(reasoningDependencyTable)
        .where(and(
          eq(reasoningDependencyTable.sourceId, input.stepId),
          eq(reasoningDependencyTable.targetId, input.dependencyId)
        ))
        .limit(1);
      if (!dep) throw new Error('Dependency not found');

      const oldChunks = (step.annotatedAnalysis as AnnotationChunk[] | null) ?? [];
      const existingLinks = extractLinks(oldChunks);
      const updatedLinks = addLinkToChunks(existingLinks, {
        dependencyId: input.dependencyId,
        startOffset: input.startOffset,
        endOffset: input.endOffset,
      });

      let chunks = buildChunksFromLinks(step.analysis, updatedLinks);
      chunks = await applyDefinitions(chunks);

      await db.update(reasoningStepTable).set({ annotatedAnalysis: chunks }).where(eq(reasoningStepTable.id, input.stepId));
      return getStepById(input.stepId);
    }),

  removeAnnotationLink: sessionProcedure
    .input(z.object({
      stepId: z.number().int(),
      startOffset: z.number().int().min(0),
      endOffset: z.number().int().min(1),
    }))
    .mutation(async ({ input }) => {
      const [step] = await db.select().from(reasoningStepTable).where(eq(reasoningStepTable.id, input.stepId)).limit(1);
      if (!step) throw new Error('Not found');

      const oldChunks = (step.annotatedAnalysis as AnnotationChunk[] | null) ?? [];
      const existingLinks = extractLinks(oldChunks);
      const updatedLinks = removeLinkAtSelection(existingLinks, input.startOffset, input.endOffset);

      let chunks = buildChunksFromLinks(step.analysis, updatedLinks);
      chunks = await applyDefinitions(chunks);

      await db.update(reasoningStepTable).set({ annotatedAnalysis: chunks }).where(eq(reasoningStepTable.id, input.stepId));
      return getStepById(input.stepId);
    }),
});
