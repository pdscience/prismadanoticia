# AGENTS.md

<!-- INSFORGE:START -->

## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **Prismadanoticia** (API base `https://9aqdv427.us-east.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env` (Vite); the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.

<!-- INSFORGE:END -->

## Prisma da Notícia notes

- Public reads use `src/lib/insforge.js` + `src/lib/services.js` with the anon key; `VITE_USE_MOCK=true` forces fixtures.
- `functions/analyze-url.ts` extracts the article, calls OpenRouter, and upserts `news` + `analyses` with `createAdminClient`.
- `functions/analyze-bias.ts` reads an article already stored in `news`, asks OpenRouter for the two-axis framing analysis, and upserts `bias_analyses`.
- Deploy them with `npx -y @insforge/cli@latest functions deploy analyze-url --file functions/analyze-url.ts` and `npx -y @insforge/cli@latest functions deploy analyze-bias --file functions/analyze-bias.ts`.
- Server-only secrets: `OPENROUTER_API_KEY` (required), `OPENROUTER_MODEL` (optional), `OPENROUTER_EMBEDDING_MODEL` (optional, default `openai/text-embedding-3-small`), `OPENROUTER_BIAS_MODEL` (optional, default `openai/gpt-4o-mini`) and `RATE_LIMIT_SALT` (required for IP hashing). Never use a `VITE_` prefix.
- New analyses generate a 1536-dim embedding, join the nearest cluster (`>= 0.78` cosine similarity) or create one for the topic. Embedding failures do not block saving the analysis.
- `analyze-url` limits 10 new analyses per IP/hour and 100 globally; `analyze-bias` limits 20 per IP/hour and 100 globally. Cached URLs bypass both limits.
- Public framing reads use `bias_feed`. `source_bias_profiles` is intentionally empty; do not assign permanent labels to real outlets without methodology and a public reference.
- Schema and seed live in `migrations/`; apply with `npx -y @insforge/cli@latest db migrations up --all`.
- Deploy the frontend with `npx -y @insforge/cli@latest deployments deploy .` after setting the `VITE_*` env vars in `deployments env set`.
- Run `npm run lint`, `npm run format:check`, `npm run test:run`, and `npm run build` before committing.
