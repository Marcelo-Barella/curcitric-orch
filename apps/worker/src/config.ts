import { z } from "zod";

const WorkerConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  WORKER_ID: z.string().default(crypto.randomUUID()),
  POLL_INTERVAL_MS: z.coerce.number().default(2000),
});

export type WorkerConfig = z.infer<typeof WorkerConfigSchema>;

export function loadWorkerConfig(): WorkerConfig {
  return WorkerConfigSchema.parse(process.env);
}
