import { describe, it, expect } from "vitest";

describe("worker poll loop", () => {
  it("exports pollLoop and claimPendingJobs", async () => {
    const mod = await import("../src/main.js");
    expect(mod.pollLoop).toBeTypeOf("function");
    expect(mod.claimPendingJobs).toBeTypeOf("function");
  });
});
