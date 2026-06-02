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
  config_snapshot: unknown;
};

async function claimPendingJobs(
  sql: postgres.Sql,
  workerId: string,
): Promise<ClaimedJob[]> {
  return (await sql`
    with picked as (
      select j.id as job_id, r.id as run_id, r.config_snapshot
      from public.orchestration_jobs j
      join public.orchestration_runs r on r.id = j.run_id
      where j.status = 'pending'
        and j.available_at <= now()
      order by j.available_at asc
      limit 5
      for update of j skip locked
    )
    update public.orchestration_jobs j
    set status = 'processing', claimed_by = ${workerId}
    from picked p
    where j.id = p.job_id
      and j.status = 'pending'
    returning j.id as job_id, p.run_id, p.config_snapshot
  `) as ClaimedJob[];
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
      try {
        await sql`
          update public.orchestration_runs
          set status = 'running'
          where id = ${job.run_id}
        `;

        await launchOrchestrationRun({
          cwd: "/workdir",
          runOrchestration: async () => ({ orchestrationRunId: job.run_id }),
        });

        await sql`
          update public.orchestration_jobs set status = 'done' where id = ${job.job_id}
        `;
        await sql`
          update public.orchestration_runs set status = 'completed' where id = ${job.run_id}
        `;
      } catch (err) {
        console.error(`Job ${job.job_id} failed:`, err);
        await sql`
          update public.orchestration_jobs set status = 'error' where id = ${job.job_id}
        `;
        await sql`
          update public.orchestration_runs set status = 'failed' where id = ${job.run_id}
        `;
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

export { pollLoop, claimPendingJobs };
