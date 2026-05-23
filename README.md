# curcitric-orch

Cursor Orch frontend and worker monorepo.

## Quick start

```bash
pnpm install
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
# Fill Supabase, DATABASE_URL (worker), and GitHub App values — see AGENTS.md
pnpm --filter web dev
```

When environment variables are already exported (for example on a cloud agent), sync local files instead:

```bash
node scripts/sync-env.mjs
pnpm --filter web dev
```

Full stack (web + worker): set `DATABASE_URL` to your Supabase Postgres URI, then `pnpm dev`.
