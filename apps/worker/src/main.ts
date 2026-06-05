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

export async function markJobCompleted(sql: postgres.Sql, job: ClaimedJob): Promise<void> {
  await sql.begin(async (txn) => {
    await txn`
      update public.orchestration_jobs set status = 'done' where id = ${job.job_id}
    `;
    await txn`
      update public.orchestration_runs set status = 'completed' where id = ${job.run_id}
    `;
  });
}

export async function markJobFailed(sql: postgres.Sql, job: ClaimedJob): Promise<void> {
  await sql.begin(async (txn) => {
    await txn`
      update public.orchestration_jobs set status = 'error' where id = ${job.job_id}
    `;
    await txn`
      update public.orchestration_runs set status = 'failed' where id = ${job.run_id}
    `;
  });
}

const COMPLETION_PERSIST_RETRIES = 3;
const COMPLETION_PERSIST_RETRY_MS = 500;

async function persistJobCompletionWithRetry(
  sql: postgres.Sql,
  job: ClaimedJob,
): Promise<void> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= COMPLETION_PERSIST_RETRIES; attempt++) {
    try {
      await markJobCompleted(sql, job);
      return;
    } catch (err) {
      lastErr = err;
      if (attempt < COMPLETION_PERSIST_RETRIES) {
        await new Promise((r) => setTimeout(r, COMPLETION_PERSIST_RETRY_MS * attempt));
      }
    }
  }
  throw lastErr;
}

export async function processClaimedJob(
  sql: postgres.Sql,
  job: ClaimedJob,
  launchOrchestrationRun: LaunchFn,
): Promise<void> {
  let orchestrationFinished = false;
  try {
    await launchOrchestrationRun({
      cwd: "/workdir",
      runOrchestration: async () => ({ orchestrationRunId: job.run_id }),
    });
    orchestrationFinished = true;
    await persistJobCompletionWithRetry(sql, job);
  } catch (err) {
    if (orchestrationFinished) {
      console.error(
        `Job ${job.job_id}: orchestration finished but completion status could not be persisted:`,
        err,
      );
      return;
    }
    console.error(`Job ${job.job_id} failed:`, err);
    try {
      await markJobFailed(sql, job);
    } catch (markErr) {
      console.error(`Job ${job.job_id}: failed to persist error status:`, markErr);
    }
  }
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
      set status = 'processing', claimed_by = ${workerId}
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

async function pollLoop(
  sql: postgres.Sql,
  workerId: string,
  launchOrchestrationRun: LaunchFn,
  pollIntervalMs: number,
) {
  console.log(`Worker ${workerId} starting poll loop`);

  while (true) {
    await new Promise((r) => setTimeout(r, pollIntervalMs));

    const jobs = await claimPendingJobs(sql, workerId);

    if (!jobs.length) continue;

    for (const job of jobs) {
      await processClaimedJob(sql, job, launchOrchestrationRun);
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
