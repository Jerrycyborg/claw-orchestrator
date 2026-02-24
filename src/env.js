import "dotenv/config";
import { z } from "zod";

const EnvSchema = z
  .object({
    OPENCLAW_API_URL: z.string().url().optional(),
    OPENCLAW_API_TOKEN: z.string().min(1).optional(),
    OPENCLAW_API_ROLE_PATH: z
      .string()
      .min(1)
      .refine((v) => v.startsWith("/"), { message: "must start with '/'" })
      .optional(),
    OPENCLAW_ROLE_CMD: z.string().min(1).optional(),
    ORCHESTRATOR_LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .optional()
  })
  .passthrough();

export function getEnv(env = process.env) {
  const parsed = EnvSchema.safeParse(env);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".") || "<env>"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${msg}`);
  }
  return parsed.data;
}
