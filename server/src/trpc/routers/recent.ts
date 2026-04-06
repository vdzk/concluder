import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { reasoningStepTable, reasoningStepVersionTable, userTable } from '../../db/schema.ts'
import { t } from '../trpc.ts'

export const recentRouter = t.router({
  list: t.procedure.query(async () => {
    const versionCount = db
      .select({
        reasoningStepId: reasoningStepVersionTable.reasoningStepId,
        count: sql<number>`count(*)`.as('version_count'),
      })
      .from(reasoningStepVersionTable)
      .groupBy(reasoningStepVersionTable.reasoningStepId)
      .as('vc');

    const rows = await db
      .select({
        id: reasoningStepTable.id,
        question: reasoningStepTable.question,
        createdAt: reasoningStepTable.createdAt,
        createdByName: userTable.name,
        versionCount: versionCount.count,
      })
      .from(reasoningStepTable)
      .innerJoin(userTable, eq(reasoningStepTable.createdBy, userTable.id))
      .leftJoin(versionCount, eq(reasoningStepTable.id, versionCount.reasoningStepId))
      .orderBy(desc(reasoningStepTable.createdAt))
      .limit(30);

    return rows.map(r => ({
      id: r.id,
      question: r.question,
      activityAt: new Date(r.createdAt).toISOString(),
      wasEdited: (r.versionCount ?? 0) > 0,
      actorName: r.createdByName,
    }));
  }),
});
