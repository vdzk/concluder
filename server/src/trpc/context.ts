import type { IncomingMessage, ServerResponse } from 'node:http';

export type Context = {
  req: IncomingMessage;
  res: ServerResponse;
};

export function createContext({ req, res }: { req: IncomingMessage; res: ServerResponse }): Context {
  return { req, res };
}
