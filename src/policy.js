const SECRET_PATTERNS = [
  /(?:api[_-]?key|secret|token|password)\s*[:=]\s*[^\s]+/i,
  /sk-[a-z0-9]{16,}/i,
  /ghp_[a-z0-9]{20,}/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/
];

const PII_PATTERNS = [
  /\b\+?\d{10,15}\b/, // broad phone pattern
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
];

const SENSITIVE_ACTION_WORDS = [
  "deploy",
  "production",
  "prod",
  "delete",
  "drop",
  "truncate",
  "rotate key",
  "config.apply",
  "update.run",
  "restart gateway"
];

export function scanPromptSafety(prompt) {
  const findings = [];
  const text = prompt || "";

  for (const p of SECRET_PATTERNS) {
    if (p.test(text))
      findings.push({ severity: "high", type: "secret-pattern", pattern: p.toString() });
  }
  for (const p of PII_PATTERNS) {
    if (p.test(text))
      findings.push({ severity: "medium", type: "pii-pattern", pattern: p.toString() });
  }

  const sensitiveAction = SENSITIVE_ACTION_WORDS.some((w) => text.toLowerCase().includes(w));
  if (sensitiveAction) {
    findings.push({
      severity: "medium",
      type: "sensitive-action",
      note: "Prompt appears to request sensitive operational action"
    });
  }

  const high = findings.some((f) => f.severity === "high");
  const blocked = high;

  return {
    blocked,
    requiresApproval: sensitiveAction,
    findings
  };
}

export function enforcePolicy(prompt, options = {}) {
  const result = scanPromptSafety(prompt);
  if (result.blocked) {
    return { ok: false, reason: "Blocked by secret-detection policy", ...result };
  }

  if (result.requiresApproval && !options.approveSensitive) {
    return {
      ok: false,
      reason: "Sensitive action requires explicit approval flag (--approve-sensitive)",
      ...result
    };
  }

  return { ok: true, ...result };
}
