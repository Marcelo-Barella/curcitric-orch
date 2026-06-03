import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const jobsInsertMigration = readFileSync(
  path.join(
    import.meta.dirname,
    "../../../supabase/migrations/20260602110000_orchestration_jobs_insert_rls.sql",
  ),
  "utf8",
);

describe("orchestration_jobs RLS migrations", () => {
  it("allows org members to insert jobs only for their own queued runs without an active job", () => {
    expect(jobsInsertMigration).toContain("jobs_insert_run_org");
    expect(jobsInsertMigration).toContain("organization_members");
    expect(jobsInsertMigration).toContain("orchestration_jobs.run_id");
    expect(jobsInsertMigration).toContain("initiating_user = auth.uid()");
    expect(jobsInsertMigration).toContain("r.status = 'queued'");
    expect(jobsInsertMigration).toContain(
      "j.status in ('pending', 'processing')",
    );
    expect(jobsInsertMigration).toContain(
      "orchestration_jobs_one_active_per_run_idx",
    );
  });

  it("allows run creators to delete their own queued runs for enqueue rollback", () => {
    expect(jobsInsertMigration).toContain("runs_delete_queued_org");
    expect(jobsInsertMigration).toContain("status = 'queued'");
    expect(jobsInsertMigration).toContain("initiating_user = auth.uid()");
  });
});
