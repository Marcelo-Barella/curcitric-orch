import { describe, it, expect, vi } from "vitest";
import { claimPendingJobs } from "../src/main.js";

describe("claimPendingJobs", () => {
  it("selects and updates inside one transaction", async () => {
    const pendingRow = {
      job_id: "job-1",
      run_id: "run-1",
      config_snapshot: {},
    };
    const select = vi.fn().mockResolvedValue([pendingRow]);
    const updateJob = vi.fn().mockResolvedValue([{ id: "job-1" }]);
    const updateRun = vi.fn().mockResolvedValue([]);
    const txn = Object.assign(
      (strings: TemplateStringsArray) => {
        const sql = strings.join("");
        if (sql.includes("select")) return select();
        if (sql.includes("orchestration_jobs")) return updateJob();
        if (sql.includes("orchestration_runs")) return updateRun();
        throw new Error(`unexpected sql: ${sql}`);
      },
      { json: vi.fn() },
    );

    const begin = vi.fn(async (fn: (t: typeof txn) => Promise<unknown>) => fn(txn));
    const sql = { begin } as unknown as import("postgres").Sql;

    const claimed = await claimPendingJobs(sql, "worker-a", 5);

    expect(begin).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(updateJob).toHaveBeenCalledTimes(1);
    expect(updateRun).toHaveBeenCalledTimes(1);
    expect(claimed).toEqual([pendingRow]);
  });

  it("skips rows that lost the pending race", async () => {
    const pendingRow = {
      job_id: "job-1",
      run_id: "run-1",
      config_snapshot: {},
    };
    const select = vi.fn().mockResolvedValue([pendingRow]);
    const updateJob = vi.fn().mockResolvedValue([]);
    const txn = Object.assign(
      (strings: TemplateStringsArray) => {
        const sql = strings.join("");
        if (sql.includes("select")) return select();
        if (sql.includes("orchestration_jobs")) return updateJob();
        throw new Error(`unexpected sql: ${sql}`);
      },
      { json: vi.fn() },
    );
    const begin = vi.fn(async (fn: (t: typeof txn) => Promise<unknown>) => fn(txn));
    const sql = { begin } as unknown as import("postgres").Sql;

    const claimed = await claimPendingJobs(sql, "worker-b", 5);

    expect(claimed).toEqual([]);
    expect(updateJob).toHaveBeenCalledTimes(1);
  });
});
