import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/src/trpc/router';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000',
      fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
    }),
  ],
});
