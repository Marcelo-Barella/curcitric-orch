import { describe, it, expect, vi } from "vitest";

describe("worker poll loop", () => {
  it("module exports pollLoop function", async () => {
    const mod = await import("../src/main.js");
    expect(mod.pollLoop).toBeTypeOf("function");
  });
});
