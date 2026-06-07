import { describe, it, expect, vi } from "vitest";
import { reclaimStaleProcessingJobs } from "../src/main.js";

describe("reclaimStaleProcessingJobs", () => {
  it("returns zero when no stale jobs exist", async () => {
    const sql = vi.fn().mockResolvedValue([]);
    const reclaimed = await reclaimStaleProcessingJobs(sql as never, 60_000);
    expect(reclaimed).toBe(0);
    expect(sql).toHaveBeenCalledTimes(1);
  });

  it("resets stale jobs and requeues runs", async () => {
    const reclaimedRows = [
      { job_id: "job-1", run_id: "run-1" },
      { job_id: "job-2", run_id: "run-1" },
    ];
    const sql = vi
      .fn()
      .mockResolvedValueOnce(reclaimedRows)
      .mockResolvedValueOnce([]);

    const reclaimed = await reclaimStaleProcessingJobs(sql as never, 60_000);

    expect(reclaimed).toBe(2);
    expect(sql).toHaveBeenCalledTimes(2);
  });
});
