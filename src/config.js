import fs from "fs";
import path from "path";
import { parse as parseYaml } from "yaml";

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

    return {
      source: file,
      config: mergeConfig(parsed || {})
    };
  }

  return {
    source: "defaults",
    config: DEFAULT_CONFIG
  };
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
