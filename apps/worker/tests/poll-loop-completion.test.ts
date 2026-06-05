import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type postgres from "postgres";
import { markJobCompleted, processClaimedJob } from "../src/main.js";

describe("markJobCompleted", () => {
  it("updates job and run in one transaction", async () => {
    const calls: string[] = [];
    const sql = {
      begin: async (fn: (txn: postgres.TransactionSql) => Promise<void>) => {
        const txn = async (strings: TemplateStringsArray) => {
          calls.push(strings.join(""));
        };
        await fn(txn as unknown as postgres.TransactionSql);
      },
    } as unknown as postgres.Sql;

    await markJobCompleted(sql, { job_id: "j1", run_id: "r1" });

    expect(calls).toHaveLength(2);
    expect(calls[0]).toContain("orchestration_jobs");
    expect(calls[0]).toContain("'done'");
    expect(calls[1]).toContain("orchestration_runs");
    expect(calls[1]).toContain("'completed'");
  });
});

describe("processClaimedJob", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not mark job failed when orchestration succeeds but completion persist fails", async () => {
    const job = { job_id: "j1", run_id: "r1" };
    const launch = vi.fn().mockResolvedValue({ orchestrationRunId: "r1" });
    let completeAttempts = 0;

    const sql = {
      begin: async (fn: (txn: postgres.TransactionSql) => Promise<void>) => {
        const txn = async (strings: TemplateStringsArray) => {
          const q = strings.join("");
          if (q.includes("orchestration_jobs") && q.includes("'done'")) {
            completeAttempts += 1;
            throw new Error("db unavailable");
          }
        };
        await fn(txn as unknown as postgres.TransactionSql);
      },
    } as unknown as postgres.Sql;

    const persistPromise = processClaimedJob(sql, job, launch);
    await vi.runAllTimersAsync();
    await persistPromise;

    expect(launch).toHaveBeenCalledTimes(1);
    expect(completeAttempts).toBe(3);
  });

  it("marks job failed when orchestration launch throws", async () => {
    const job = { job_id: "j1", run_id: "r1" };
    const launch = vi.fn().mockRejectedValue(new Error("orchestration crashed"));
    const calls: string[] = [];

    const sql = {
      begin: async (fn: (txn: postgres.TransactionSql) => Promise<void>) => {
        const txn = async (strings: TemplateStringsArray) => {
          calls.push(strings.join(""));
        };
        await fn(txn as unknown as postgres.TransactionSql);
      },
    } as unknown as postgres.Sql;

    await processClaimedJob(sql, job, launch);

    expect(launch).toHaveBeenCalledTimes(1);
    expect(calls.some((q) => q.includes("'error'"))).toBe(true);
    expect(calls.some((q) => q.includes("'failed'"))).toBe(true);
  });
});
