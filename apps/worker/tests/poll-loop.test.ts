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

  it("claims pending jobs in one update statement", () => {
    expect(mainSource).toMatch(
      /with picked as \([\s\S]*for update of j skip locked[\s\S]*update public\.orchestration_jobs/,
    );
    expect(mainSource).not.toMatch(
      /for update of j skip locked[\s\S]*await sql\.begin/,
    );
  });
});
