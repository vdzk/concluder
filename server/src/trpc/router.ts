import { t } from './trpc.ts'
import { reasoningStepRouter } from './routers/reasoningStep.ts'
import { userRouter } from './routers/user.ts'
import { recentRouter } from './routers/recent.ts'
import { featuredRouter } from './routers/featured.ts'
import { definitionRouter } from './routers/definition.ts'
import { talkMessageRouter } from './routers/talkMessage.ts'

export const appRouter = t.router({
  reasoningStep: reasoningStepRouter,
  user: userRouter,
  recent: recentRouter,
  featured: featuredRouter,
  definition: definitionRouter,
  talkMessage: talkMessageRouter,
});

export type AppRouter = typeof appRouter;
