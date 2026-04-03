import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/src/trpc/router';

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_TRPC_URL ?? 'http://localhost:4000',
      fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
    }),
  ],
});
