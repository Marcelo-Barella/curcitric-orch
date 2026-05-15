# AGENTS.md

## Dev environment tips

- Use `pnpm dlx turbo run where <project_name>` to jump to a package instead of scanning with `ls`.
- Run `pnpm install --filter <project_name>` when you need that package linked in the workspace so tooling resolves it cleanly.
- Check the `name` field inside each package's `package.json` to confirm the filter name (`web`, `@curcitric-orch/worker`, `@curcitric-orch/shared`), not only the root workspace name.

### Run the application

- From the repo root: `pnpm install`, then copy `.env.example` to `.env` and fill Supabase-related values (see `apps/web/.env.example` for the web app if you use `.env.local` there).
- Full monorepo dev (web + worker): `pnpm dev`.
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
