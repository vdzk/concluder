import { initTRPC } from '@trpc/server'
import { eq } from 'drizzle-orm'
import crypto from 'node:crypto'
import { db } from '../db/index.ts'
import { userTable, userSessionTable, adminTable } from '../db/schema.ts'
import type { Context } from './context.ts'
import { generateName } from '../lib/nameGenerator.ts'

export const t = initTRPC.context<Context>().create()

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

export const sessionProcedure = t.procedure.use(sessionMiddleware)

const adminMiddleware = sessionMiddleware.unstable_pipe(async ({ ctx, next }) => {
  const [admin] = await db
    .select()
    .from(adminTable)
    .where(eq(adminTable.userId, ctx.userId))
    .limit(1);
  if (!admin) throw new Error('Forbidden');
  return next({ ctx });
});

export const adminProcedure = t.procedure.use(adminMiddleware)
