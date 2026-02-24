import fs from "fs";
import path from "path";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const DEFAULT_CONFIG = Object.freeze({
  version: 1,
  name: "claw-orchestrator",
  routing: {},
  policy: {
    block_on_high_severity: true,
    require_confidence_threshold: 0.7
  },
  channelPolicy: undefined
});

const OrchestratorConfigSchema = z
  .object({
    version: z.number().int().positive().default(1),
    name: z.string().min(1).default("claw-orchestrator"),
    routing: z.record(z.string(), z.any()).default({}),
    policy: z
      .object({
        block_on_high_severity: z.boolean().default(true),
        require_confidence_threshold: z.number().min(0).max(1).default(0.7)
      })
      .default({}),
    channelPolicy: z.any().optional()
  })
  .passthrough();

export function loadOrchestratorConfig(cwd = process.cwd()) {
  const candidates = [
    path.resolve(cwd, "config", "orchestrator.yaml"),
    path.resolve(cwd, "config", "orchestrator.yml"),
    path.resolve(cwd, "config", "orchestrator.json")
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, "utf8");
    const parsed = file.endsWith(".json") ? JSON.parse(raw) : parseYaml(raw);

    const merged = mergeConfig(parsed || {});
    return {
      source: file,
      config: validateConfig(merged, file)
    };
  }

  return {
    source: "defaults",
    config: validateConfig(DEFAULT_CONFIG, "defaults")
  };
}

function validateConfig(config, sourceLabel) {
  const parsed = OrchestratorConfigSchema.safeParse(config);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `${i.path.join(".") || "<config>"}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid orchestrator config (${sourceLabel}): ${msg}`);
  }
  return parsed.data;
}

function mergeConfig(parsed) {
  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    policy: {
      ...DEFAULT_CONFIG.policy,
      ...(parsed.policy || {})
    }
  };
}
