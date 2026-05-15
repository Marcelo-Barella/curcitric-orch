import { describe, expect, it } from "vitest";
import { OrchestrationJobSchema, OrchestrationRunSchema } from "../src/run.js";

describe("OrchestrationRunSchema", () => {
  it("parses valid run", () => {
    const result = OrchestrationRunSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      orgId: "550e8400-e29b-41d4-a716-446655440001",
      projectId: "550e8400-e29b-41d4-a716-446655440002",
      initiatingUser: "550e8400-e29b-41d4-a716-446655440003",
      status: "queued",
      configSnapshot: {},
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = OrchestrationRunSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      orgId: "550e8400-e29b-41d4-a716-446655440001",
      projectId: "550e8400-e29b-41d4-a716-446655440002",
      initiatingUser: "550e8400-e29b-41d4-a716-446655440003",
      status: "invalid",
      configSnapshot: {},
      createdAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("OrchestrationJobSchema", () => {
  it("parses valid job", () => {
    const result = OrchestrationJobSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      runId: "550e8400-e29b-41d4-a716-446655440001",
      status: "pending",
      availableAt: "2026-01-01T00:00:00Z",
    });
    expect(result.success).toBe(true);
  });
});
