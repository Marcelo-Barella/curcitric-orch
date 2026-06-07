import { describe, it, expect, vi } from "vitest";
import { claimPendingJobs } from "../src/main.js";

describe("claimPendingJobs", () => {
  it("claims jobs inside one transaction", async () => {
    const claimedRow = { job_id: "job-1", run_id: "run-1" };
    const claimUpdate = vi.fn().mockResolvedValue([claimedRow]);
    const updateRun = vi.fn().mockResolvedValue([]);
    const txn = Object.assign(
      (strings: TemplateStringsArray) => {
        const sql = strings.join("");
        if (sql.includes("with picked")) {
          expect(sql).toContain("claimed_at = now()");
          return claimUpdate();
        }
        if (sql.includes("orchestration_runs")) return updateRun();
        throw new Error(`unexpected sql: ${sql}`);
      },
      { json: vi.fn() },
    );

    const begin = vi.fn(async (fn: (t: typeof txn) => Promise<unknown>) => fn(txn));
    const sql = { begin } as unknown as import("postgres").Sql;

    const claimed = await claimPendingJobs(sql, "worker-a", 5);

    expect(begin).toHaveBeenCalledTimes(1);
    expect(claimUpdate).toHaveBeenCalledTimes(1);
    expect(updateRun).toHaveBeenCalledTimes(1);
    expect(claimed).toEqual([claimedRow]);
  });

  it("returns empty when no pending jobs match", async () => {
    const claimUpdate = vi.fn().mockResolvedValue([]);
    const txn = Object.assign(
      (strings: TemplateStringsArray) => {
        const sql = strings.join("");
        if (sql.includes("with picked")) return claimUpdate();
        throw new Error(`unexpected sql: ${sql}`);
      },
      { json: vi.fn() },
    );
    const begin = vi.fn(async (fn: (t: typeof txn) => Promise<unknown>) => fn(txn));
    const sql = { begin } as unknown as import("postgres").Sql;

    const claimed = await claimPendingJobs(sql, "worker-b", 5);

    expect(claimed).toEqual([]);
    expect(claimUpdate).toHaveBeenCalledTimes(1);
  });
});
