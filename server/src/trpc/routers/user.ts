import { eq } from 'drizzle-orm'
import { db } from '../../db/index.ts'
import { adminTable } from '../../db/schema.ts'
import { t, sessionProcedure } from '../trpc.ts'

export const userRouter = t.router({
  isAdmin: sessionProcedure.query(async ({ ctx }) => {
    const [admin] = await db
      .select()
      .from(adminTable)
      .where(eq(adminTable.userId, ctx.userId))
      .limit(1);
    return { isAdmin: !!admin };
  }),
});
