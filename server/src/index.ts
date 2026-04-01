import 'dotenv/config';
import cors from 'cors';
import { createHTTPServer } from '@trpc/server/adapters/standalone'
import { appRouter } from './trpc/router.ts'
import { createContext } from './trpc/context.ts'

const server = createHTTPServer({
  middleware: cors({ origin: true, credentials: true }),
  router: appRouter,
  createContext,
});

server.listen(4000);
console.log('tRPC server listening on http://localhost:4000');
