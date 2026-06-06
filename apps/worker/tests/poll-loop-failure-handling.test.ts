import { describe, it, expect, vi, afterEach } from "vitest";
import * as main from "../src/main.js";

const job = { job_id: "job-1", run_id: "run-1" };

function mockSql() {
  const calls: string[] = [];
  const sql = Object.assign(
    (strings: TemplateStringsArray) => {
      calls.push(strings.join(""));
      return Promise.resolve([]);
    },
    { begin: vi.fn() },
  );
  return { sql: sql as unknown as import("postgres").Sql, calls };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("processClaimedJob", () => {
  it("marks the run failed when orchestration throws", async () => {
    const { sql, calls } = mockSql();
    const launch = vi.fn().mockRejectedValue(new Error("orchestration crashed"));

    await main.processClaimedJob(sql, job, launch);

    expect(launch).toHaveBeenCalledTimes(1);
    expect(calls.some((c) => c.includes("status = 'error'"))).toBe(true);
    expect(calls.some((c) => c.includes("status = 'failed'"))).toBe(true);
    expect(calls.some((c) => c.includes("status = 'done'"))).toBe(false);
  });

  it("does not mark the run failed when only completion persistence throws", async () => {
    const { sql, calls } = mockSql();
    const launch = vi.fn().mockResolvedValue({ orchestrationRunId: job.run_id });
    vi.spyOn(main, "persistJobCompletion").mockRejectedValue(new Error("db unavailable"));

    await main.processClaimedJob(sql, job, launch);

    expect(launch).toHaveBeenCalledTimes(1);
    expect(calls.some((c) => c.includes("status = 'error'"))).toBe(false);
    expect(calls.some((c) => c.includes("status = 'failed'"))).toBe(false);
  });
});
