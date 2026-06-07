import { describe, it, expect, vi } from "vitest";
import { markJobCompleted, persistJobCompletion } from "../src/main.js";

describe("job completion updates", () => {
  it("marks job and run completed in one transaction", async () => {
    const jobUpdate = vi.fn().mockResolvedValue([]);
    const runUpdate = vi.fn().mockResolvedValue([]);
    const txn = Object.assign(
      (strings: TemplateStringsArray) => {
        const sql = strings.join("");
        if (sql.includes("orchestration_jobs")) return jobUpdate();
        if (sql.includes("orchestration_runs")) return runUpdate();
        throw new Error(`unexpected sql: ${sql}`);
      },
      { json: vi.fn() },
    );
    const begin = vi.fn(async (fn: (t: typeof txn) => Promise<unknown>) => fn(txn));
    const sql = { begin } as unknown as import("postgres").Sql;

    await markJobCompleted(sql, { job_id: "job-1", run_id: "run-1" });

    expect(begin).toHaveBeenCalledTimes(1);
    expect(jobUpdate).toHaveBeenCalledTimes(1);
    expect(runUpdate).toHaveBeenCalledTimes(1);
  });

  it("retries completion updates before surfacing failure", async () => {
    const jobUpdate = vi.fn().mockResolvedValue([]);
    const runUpdate = vi.fn().mockResolvedValue([]);
    const txn = Object.assign(
      (strings: TemplateStringsArray) => {
        const sql = strings.join("");
        if (sql.includes("orchestration_jobs")) return jobUpdate();
        if (sql.includes("orchestration_runs")) return runUpdate();
        throw new Error(`unexpected sql: ${sql}`);
      },
      { json: vi.fn() },
    );
    const begin = vi
      .fn()
      .mockRejectedValueOnce(new Error("transient"))
      .mockImplementation(async (fn: (t: typeof txn) => Promise<unknown>) => fn(txn));
    const sql = { begin } as unknown as import("postgres").Sql;

    await persistJobCompletion(sql, { job_id: "job-1", run_id: "run-1" }, 2);

    expect(begin).toHaveBeenCalledTimes(2);
    expect(jobUpdate).toHaveBeenCalledTimes(1);
    expect(runUpdate).toHaveBeenCalledTimes(1);
  });
});
