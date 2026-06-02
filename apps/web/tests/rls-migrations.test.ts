import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const migration = readFileSync(
  path.join(
    import.meta.dirname,
    "../../../supabase/migrations/20260529110500_orchestration_jobs_insert_policy.sql",
  ),
  "utf8",
);

describe("orchestration_jobs insert migration", () => {
  it("restricts job insert to initiating user on queued runs", () => {
    expect(migration).toContain("jobs_insert_run_org");
    expect(migration).toContain("initiating_user = auth.uid()");
    expect(migration).toContain("status = 'queued'");
  });

  it("restricts run delete to initiating user on queued runs", () => {
    expect(migration).toContain("runs_delete_own_queued");
    expect(migration).toContain("initiating_user = auth.uid()");
  });
});
