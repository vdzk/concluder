import { eq, desc, sql } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { reasoningStepTable, reasoningStepVersionTable, userTable } from '../../db/schema.ts'
import { t } from '../trpc.ts'

export const recentRouter = t.router({
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
});
