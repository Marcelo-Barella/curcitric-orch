import { randomUUID } from "node:crypto";
import postgres from "postgres";

interface LaunchDeps {
  cwd: string;
  runOrchestration: () => Promise<{ orchestrationRunId: string }>;
}

type LaunchFn = (deps: LaunchDeps) => Promise<{ orchestrationRunId: string }>;

type ClaimedJob = {
  job_id: string;
  run_id: string;
};

const DEFAULT_STALE_PROCESSING_MS = 30 * 60 * 1000;
const DEFAULT_COMPLETION_UPDATE_RETRIES = 3;

function readStaleProcessingMs(): number {
  const raw = process.env.STALE_PROCESSING_MS;
  if (raw === undefined || raw === "") return DEFAULT_STALE_PROCESSING_MS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 60_000) return DEFAULT_STALE_PROCESSING_MS;
  return Math.floor(parsed);
}

export async function reclaimStaleProcessingJobs(
  sql: postgres.Sql,
  staleAfterMs = readStaleProcessingMs(),
): Promise<number> {
  const staleBefore = new Date(Date.now() - staleAfterMs).toISOString();
  const reclaimed = await sql<{ job_id: string; run_id: string }[]>`
    with stale as (
      select j.id, j.run_id
      from public.orchestration_jobs j
      where j.status = 'processing'
        and j.claimed_at is not null
        and j.claimed_at < ${staleBefore}::timestamptz
      for update skip locked
    )
    update public.orchestration_jobs j
    set status = 'pending', claimed_by = null, claimed_at = null
    from stale
    where j.id = stale.id
    returning j.id as job_id, stale.run_id as run_id
  `;

  if (!reclaimed.length) return 0;

  const runIds = [...new Set(reclaimed.map((row) => row.run_id))];
  await sql`
    update public.orchestration_runs
    set status = 'queued'
    where id = any(${runIds}::uuid[])
      and status = 'running'
  `;
  return reclaimed.length;
}

export async function claimPendingJobs(
  sql: postgres.Sql,
  workerId: string,
  limit = 5,
): Promise<ClaimedJob[]> {
  return sql.begin(async (txn) => {
    const claimed = await txn<ClaimedJob[]>`
      with picked as (
        select j.id, j.run_id
        from public.orchestration_jobs j
        where j.status = 'pending'
          and j.available_at <= now()
        order by j.available_at asc
        limit ${limit}
        for update skip locked
      )
      update public.orchestration_jobs j
      set status = 'processing', claimed_by = ${workerId}, claimed_at = now()
      from picked
      where j.id = picked.id
      returning j.id as job_id, picked.run_id as run_id
    `;

    if (!claimed.length) return [];

    const runIds = [...new Set(claimed.map((row) => row.run_id))];
    await txn`
      update public.orchestration_runs
      set status = 'running'
      where id = any(${runIds}::uuid[])
    `;

    return claimed;
  });
}

export async function markJobFailed(sql: postgres.Sql, job: ClaimedJob): Promise<void> {
  await sql.begin(async (txn) => {
    await txn`
      update public.orchestration_jobs
      set status = 'error', claimed_at = null
      where id = ${job.job_id}
    `;
    await txn`
      update public.orchestration_runs
      set status = 'failed'
      where id = ${job.run_id}
    `;
  });
}

export async function markJobCompleted(sql: postgres.Sql, job: ClaimedJob): Promise<void> {
  await sql.begin(async (txn) => {
    await txn`
      update public.orchestration_jobs
      set status = 'done', claimed_at = null
      where id = ${job.job_id}
    `;
    await txn`
      update public.orchestration_runs
      set status = 'completed'
      where id = ${job.run_id}
    `;
  });
}

export async function persistJobCompletion(
  sql: postgres.Sql,
  job: ClaimedJob,
  retries = DEFAULT_COMPLETION_UPDATE_RETRIES,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      await markJobCompleted(sql, job);
      return;
    } catch (err) {
      lastError = err;
      if (attempt + 1 < retries) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

async function pollLoop(
  sql: postgres.Sql,
  workerId: string,
  launchOrchestrationRun: LaunchFn,
  pollIntervalMs: number,
) {
  console.log(`Worker ${workerId} starting poll loop`);

  while (true) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));

    const reclaimed = await reclaimStaleProcessingJobs(sql);
    if (reclaimed > 0) {
      console.warn(`Reclaimed ${reclaimed} stale processing job(s)`);
    }

    const jobs = await claimPendingJobs(sql, workerId);

    if (!jobs.length) continue;

    for (const job of jobs) {
      try {
        await launchOrchestrationRun({
          cwd: "/workdir",
          runOrchestration: async () => ({ orchestrationRunId: job.run_id }),
        });
      } catch (err) {
        console.error(`Job ${job.job_id} failed:`, err);
        await markJobFailed(sql, job);
        continue;
      }

      try {
        await persistJobCompletion(sql, job);
      } catch (err) {
        console.error(
          `Job ${job.job_id} orchestration succeeded but completion updates failed:`,
          err,
        );
      }
    }
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL required");

  const sql = postgres(databaseUrl, { ssl: "require" });
  const workerId = process.env.WORKER_ID ?? randomUUID();
  const pollInterval = Number(process.env.POLL_INTERVAL_MS ?? 2000);

  const { launchOrchestrationRun } = await import("cursor-orch");

  await pollLoop(sql, workerId, launchOrchestrationRun, pollInterval);
}

const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith("/main.ts") ||
    process.argv[1].endsWith("/main.js") ||
    process.argv[1].includes("tsx"));

if (isMainModule) {
  main().catch((err) => {
    console.error("Worker crashed:", err);
    process.exit(1);
  });
}

export { pollLoop };
