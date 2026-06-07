import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const mainSource = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/main.ts"),
  "utf8",
);

describe("worker poll loop", () => {
  it("module exports pollLoop and claimPendingJobs", async () => {
    const mod = await import("../src/main.js");
    expect(mod.pollLoop).toBeTypeOf("function");
    expect(mod.claimPendingJobs).toBeTypeOf("function");
  });

  it("claims pending jobs atomically in a transaction", () => {
    expect(mainSource).toMatch(
      /with picked as \([\s\S]*for update skip locked[\s\S]*update public\.orchestration_jobs/,
    );
    expect(mainSource).toMatch(/sql\.begin/);
    expect(mainSource).toMatch(
      /update public\.orchestration_runs[\s\S]*set status = 'running'/,
    );
    expect(mainSource).toMatch(/reclaimStaleProcessingJobs/);
    expect(mainSource).toMatch(/persistJobCompletion/);
    expect(mainSource).not.toContain("config_snapshot");
  });
});
