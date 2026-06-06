import { describe, it, expect, vi } from "vitest";
import { persistJobCompletion } from "../src/main.js";

const job = { job_id: "job-1", run_id: "run-1" };

describe("persistJobCompletion", () => {
  it("marks job and run completed in one transaction", async () => {
    const updateJob = vi.fn().mockResolvedValue([]);
    const updateRun = vi.fn().mockResolvedValue([]);
    const txn = Object.assign(
      (strings: TemplateStringsArray) => {
        const sql = strings.join("");
        if (sql.includes("orchestration_jobs")) return updateJob();
        if (sql.includes("orchestration_runs")) return updateRun();
        throw new Error(`unexpected sql: ${sql}`);
      },
      { json: vi.fn() },
    );
    const begin = vi.fn(async (fn: (t: typeof txn) => Promise<unknown>) => fn(txn));
    const sql = { begin } as unknown as import("postgres").Sql;

    await persistJobCompletion(sql, job);

    expect(begin).toHaveBeenCalledTimes(1);
    expect(updateJob).toHaveBeenCalledTimes(1);
    expect(updateRun).toHaveBeenCalledTimes(1);
  });

  it("retries transient persistence failures", async () => {
    const updateJob = vi
      .fn()
      .mockRejectedValueOnce(new Error("connection reset"))
      .mockResolvedValue([]);
    const updateRun = vi.fn().mockResolvedValue([]);
    const txn = Object.assign(
      (strings: TemplateStringsArray) => {
        const sql = strings.join("");
        if (sql.includes("orchestration_jobs")) return updateJob();
        if (sql.includes("orchestration_runs")) return updateRun();
        throw new Error(`unexpected sql: ${sql}`);
      },
      { json: vi.fn() },
    );
    const begin = vi.fn(async (fn: (t: typeof txn) => Promise<unknown>) => fn(txn));
    const sql = { begin } as unknown as import("postgres").Sql;

    await persistJobCompletion(sql, job, { maxAttempts: 2, retryDelayMs: 0 });

    expect(begin).toHaveBeenCalledTimes(2);
    expect(updateJob).toHaveBeenCalledTimes(2);
  });
});
