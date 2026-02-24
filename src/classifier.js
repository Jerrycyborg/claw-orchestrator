import { Intents } from "./types.js";

const SEC_WORDS = [
  "security",
  "secure",
  "hardening",
  "firewall",
  "ssh",
  "compliance",
  "audit",
  "risk",
  "policy",
  "config"
];
const RESEARCH_WORDS = [
  "research",
  "compare",
  "options",
  "evaluate",
  "benchmark",
  "pros",
  "cons",
  "market",
  "feasibility",
  "why"
];
const BUILD_WORDS = [
  "implement",
  "build",
  "create",
  "fix",
  "refactor",
  "code",
  "feature",
  "bug",
  "add",
  "develop"
];

export function classifyPrompt(prompt) {
  const p = (prompt || "").toLowerCase();
  const score = { research: 0, build: 0, security: 0 };

  for (const w of RESEARCH_WORDS) if (p.includes(w)) score.research += 1;
  for (const w of BUILD_WORDS) if (p.includes(w)) score.build += 1;
  for (const w of SEC_WORDS) if (p.includes(w)) score.security += 1;

  if (score.security >= 2 || (score.security >= 1 && score.build === 0 && score.research === 0)) {
    return { intent: Intents.SECURITY_OPS, confidence: confidence(score.security, score) };
  }
  if (score.research >= 2 && score.build <= 1) {
    return { intent: Intents.RESEARCH_HEAVY, confidence: confidence(score.research, score) };
  }
  if (score.build >= 1) {
    return { intent: Intents.BUILD_CHANGE, confidence: confidence(score.build, score) };
  }
  return { intent: Intents.AMBIGUOUS_PARALLEL, confidence: 0.55 };
}

function confidence(primary, scores) {
  const total = scores.research + scores.build + scores.security;
  if (!total) return 0.55;
  return Math.min(0.95, Math.max(0.6, primary / total));
}
