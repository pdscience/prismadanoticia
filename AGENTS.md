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
- `functions/analyze-url.ts` extracts the article, calls OpenRouter, and upserts `news` + `analyses` with `createAdminClient`. It accepts an optional `topic` in the body to store the article under a searched topic.
- `functions/analyze-bias.ts` reads an article already stored in `news`, asks OpenRouter for the two-axis framing analysis, and upserts `bias_analyses`.
- `functions/search-web.ts` searches the web through the OpenRouter `web` plugin and returns candidate article URLs; it caches them in `web_searches` (24h) and rate limits 10 searches per IP/hour, 50 globally.
- Deploy them with `npx -y @insforge/cli@latest functions deploy analyze-url --file functions/analyze-url.ts`, `npx -y @insforge/cli@latest functions deploy analyze-bias --file functions/analyze-bias.ts` and `npx -y @insforge/cli@latest functions deploy search-web --file functions/search-web.ts`.
- Server-only secrets: `OPENROUTER_API_KEY` (required), `OPENROUTER_MODEL` (optional), `OPENROUTER_EMBEDDING_MODEL` (optional, default `openai/text-embedding-3-small`), `OPENROUTER_BIAS_MODEL` (optional, default `openai/gpt-4o-mini`), `OPENROUTER_SEARCH_MODEL` (optional, default `openai/gpt-4o-mini`) and `RATE_LIMIT_SALT` (required for IP hashing). Never use a `VITE_` prefix.
- New analyses generate a 1536-dim embedding, join the nearest cluster (`>= 0.78` cosine similarity) or create one for the topic. Embedding failures do not block saving the analysis.
- `analyze-url` limits 10 new analyses per IP/hour and 100 globally; `analyze-bias` limits 20 per IP/hour and 100 globally. Cached URLs bypass both limits.
- Public framing reads use `bias_feed`. `source_bias_profiles` is intentionally empty; do not assign permanent labels to real outlets without methodology and a public reference.
- `/analise` also reads `perspective_feed` for "Perspectivas nesta história": one row per outlet per cluster, grouped by the text-level `text_label`. Empty coverage is shown as empty, never invented.
- `/cobertura` reuses `analysis_feed` + `perspective_feed`; the bar uses text labels, while `source_bias_profiles` supplies optional curated outlet ratings. It never calls `analyze-url`, never uses fixtures, and never invents ratings.
- `/comparacao` searches the web through `search-web`, filters candidates in `src/lib/websearch.js` (one article per outlet, max 6) and analyses the chosen ones with `analyze-url` (max 4 per round, 2 in parallel).
- `trend_feed` and `stats_feed` (migration `20261021160000_add-trend-stats-views.sql`) feed the landing with real numbers: trends aggregate the last 7 days per topic, stats count distinct real outlets. Both ignore the `veiculo-de-exemplo` source.
- `analyze-url` returns `evidences[].quote`, the literal excerpt from the article. It comes from the model as-is (no substring validation) and is optional.
- BlindSpot and Replay are retired: no routes, no views, no services. Their tables stay in the database but are unused.
- Schema and seed live in `migrations/`; apply with `npx -y @insforge/cli@latest db migrations up --all`.
- Deploy the frontend with `npx -y @insforge/cli@latest deployments deploy .` after setting the `VITE_*` env vars in `deployments env set`.
- The deploy upload skips any path segment named `coverage`, `build`, `skills`, `cache`, `turbo` or `dist`. Never name a frontend folder `coverage`: the components live in `src/components/cobertura/`.
- Run `npm run lint`, `npm run format:check`, `npm run test:run`, and `npm run build` before committing.
