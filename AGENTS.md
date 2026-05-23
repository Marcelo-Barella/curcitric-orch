# AGENTS.md

## Dev environment tips

- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` when you need that package linked in the workspace so tooling resolves it cleanly.
- Check the `name` field inside each package's `package.json` to confirm the filter name (`web`, `@curcitric-orch/worker`, `@curcitric-orch/shared`), not only the root workspace name.

### Environment variables

Copy `.env.example` to `.env` at the repo root, or run `pnpm setup:env` to seed `.env` and `apps/web/.env.local` from `.env.example` and merge any variables already exported in your shell (cloud agents often inject Supabase keys this way).

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | web | Supabase project URL (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | web (RLS tests) | Service role for server-side tests |
| `DATABASE_URL` | worker | Postgres connection URL (Supabase pooler or direct) |
| `GITHUB_APP_ID` | web (GitHub App integration) | GitHub App numeric ID |
| `GITHUB_APP_PRIVATE_KEY` | web (GitHub App integration) | PEM private key for the GitHub App |
| `WORKER_ID` | worker | Optional stable worker identity (defaults to a random UUID) |
| `POLL_INTERVAL_MS` | worker | Job poll interval in ms (default `2000`) |

`apps/web/.env.example` mirrors the same keys for Next.js when you prefer `.env.local` under `apps/web` only.

### Run the application

- From the repo root: `pnpm install`, then `pnpm setup:env` (or manually copy `.env.example` to `.env` and fill values).
- Full monorepo dev (web + worker): `pnpm dev` (worker also needs `DATABASE_URL` and a resolvable `cursor-orch` install for orchestration launches).
- Web only: `pnpm --filter web dev`.
- Worker only: `pnpm --filter @curcitric-orch/worker dev`.
- Docker (production-style Next.js image): ensure `.env` defines `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (also used as build args), then `docker compose build` and `docker compose up`. Rebuild after changing any `NEXT_PUBLIC_*` value.

## Testing instructions

- There is no `.github/workflows` folder in this repo yet; before merging, run the checks below locally (add CI under `.github/workflows` when you introduce it).
- Run `pnpm turbo run test --filter <project_name>` to run every test task defined for that package.
- From the package directory you can call `pnpm test` directly. The change should pass all tests before you merge.
- To focus Vitest: `pnpm exec vitest run -t "<test name>"` from the package root (or `pnpm vitest run -t "<test name>"` if the package exposes it).
- Web also defines `pnpm --filter web test:rls` and `pnpm --filter web test:e2e` (Playwright); install browsers once with `pnpm --filter web test:e2e:install` if you run e2e locally.
- After moving files or changing imports, run `pnpm lint --filter <project_name>` so ESLint still passes where configured.
- Add or update tests for the code you change, even if nobody asked.

## PR instructions

- Title format: `[<project_name>] <Title>` using the workspace package name (for example `[web]`, `[@curcitric-orch/worker]`, `[@curcitric-orch/shared]`).
- Always run `pnpm lint` and `pnpm test` before committing.
