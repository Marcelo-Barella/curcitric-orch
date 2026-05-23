# AGENTS.md

## Dev environment tips

- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` when you need that package linked in the workspace so tooling resolves it cleanly.
- Check the `name` field inside each package's `package.json` to confirm the filter name (`web`, `@curcitric-orch/worker`, `@curcitric-orch/shared`), not only the root workspace name.

### Environment variables

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | web | Supabase project URL (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | Supabase anon key (browser + server) |
| `SUPABASE_SERVICE_ROLE_KEY` | web (tests, admin) | Bypass RLS in Vitest RLS suite |
| `DATABASE_URL` | worker | Postgres URI for job polling (`ssl` required in worker) |
| `WORKER_ID` | worker | Optional worker identity (defaults to random UUID) |
| `POLL_INTERVAL_MS` | worker | Poll interval in ms (default `2000`) |
| `GITHUB_APP_ID` | web (future GitHub App routes) | GitHub App numeric id |
| `GITHUB_APP_PRIVATE_KEY` | web (future GitHub App routes) | GitHub App PEM private key |

- Root template: `.env.example`. Web-only template: `apps/web/.env.example`.
- From the repo root, copy templates manually **or** sync from your shell / cloud-agent secrets: `node scripts/sync-env.mjs` (writes `.env` and `apps/web/.env.local` from the current process environment).
- `pnpm --filter web dev` reads `apps/web/.env.local`. `pnpm dev` (turbo) and the worker read the repo-root `.env` when exported in the shell; run `set -a && source .env && set +a` before `pnpm dev` if you rely on the root file.
- Cloud agents: inject `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_APP_*`, and `DATABASE_URL` (worker) as environment secrets, then run `node scripts/sync-env.mjs` once per session.

### Run the application

- From the repo root: `pnpm install`, configure env (see above), then `node scripts/sync-env.mjs` when secrets are already in the environment.
- Full monorepo dev (web + worker): requires `DATABASE_URL` in addition to Supabase keys — `pnpm dev`.
- Web only: `pnpm --filter web dev` (needs `apps/web/.env.local` or exported `NEXT_PUBLIC_*`).
- Worker only: `pnpm --filter @curcitric-orch/worker dev` (requires `DATABASE_URL`).
- Docker (production-style Next.js image): ensure `.env` defines `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (also used as build args), then `docker compose build` and `docker compose up`. Rebuild after changing any `NEXT_PUBLIC_*` value.

## Testing instructions

- CI runs via `.github/workflows/ci.yml` on push; before merging, run the checks below locally as well.
- Run `pnpm turbo run test --filter <project_name>` to run every test task defined for that package.
- From the package directory you can call `pnpm test` directly. The change should pass all tests before you merge.
- To focus Vitest: `pnpm exec vitest run -t "<test name>"` from the package root (or `pnpm vitest run -t "<test name>"` if the package exposes it).
- Web also defines `pnpm --filter web test:rls` and `pnpm --filter web test:e2e` (Playwright); install browsers once with `pnpm --filter web test:e2e:install` if you run e2e locally.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` so ESLint still passes where configured.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions

- Title format: `[<project_name>] <Title>` using the workspace package name (for example `[web]`, `[@curcitric-orch/worker]`, `[@curcitric-orch/shared]`).
- Always run `pnpm lint` and `pnpm test` before committing.
