import { z } from "zod";

export const uuid = z.string().uuid();

export const OrchestrationRunStatus = z.enum(["pending", "queued", "running", "completed", "failed"]);
export type OrchestrationRunStatus = z.infer<typeof OrchestrationRunStatus>;

export const OrchestrationJobStatus = z.enum(["pending", "processing", "done", "error"]);
export type OrchestrationJobStatus = z.infer<typeof OrchestrationJobStatus>;

export const OrchestrationRunSchema = z.object({
  id: uuid,
  orgId: uuid,
  projectId: uuid,
  initiatingUser: uuid,
  status: OrchestrationRunStatus,
  configSnapshot: z.record(z.unknown()).default({}),
  createdAt: z.string().datetime(),
});

export type OrchestrationRun = z.infer<typeof OrchestrationRunSchema>;

export const OrchestrationJobSchema = z.object({
  id: uuid,
  runId: uuid,
  status: OrchestrationJobStatus,
  claimedBy: z.string().nullable().optional(),
  availableAt: z.string().datetime(),
});

export type OrchestrationJob = z.infer<typeof OrchestrationJobSchema>;
