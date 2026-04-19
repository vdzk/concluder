# Concluder

A wiki-style reasoning platform.

Live at [concluder.org](https://concluder.org/)

## Tech Stack

TypeScript end-to-end — from database schema to UI components:

- **Database** — PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/) (typed schema)
- **API** — [tRPC](https://trpc.io/) with [Zod](https://zod.dev/) validation (fully typed, no codegen)
- **Server** — Node.js with LLM API integration for AI-assisted features
- **Client** — [SolidJS](https://solidjs.com/) + [Tailwind CSS](https://tailwindcss.com/), bundled with [Vite](https://vitejs.dev/)

## License

MIT
