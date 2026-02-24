import pino from "pino";
import { getEnv } from "./env.js";

const env = getEnv(process.env);

export const logger = pino(
  {
    level: env.ORCHESTRATOR_LOG_LEVEL || "info",
    base: undefined
  },
  // Keep CLI JSON outputs clean; send logs to stderr.
  pino.destination(2)
);
