import { describe, it, expect, vi } from "vitest";

describe("worker poll loop", () => {
  it("module exports pollLoop and claimPendingJobs", async () => {
    const mod = await import("../src/main.js");
    expect(mod.pollLoop).toBeTypeOf("function");
    expect(mod.claimPendingJobs).toBeTypeOf("function");
  });
});
