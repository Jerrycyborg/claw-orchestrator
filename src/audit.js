import fs from "fs";
import path from "path";

function resolveAuditFile(auditDir) {
  const dir = path.resolve(process.cwd(), auditDir || ".ai/handoff");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "AUDIT.log.jsonl");
}

export function recordAuditEvent(event, options = {}) {
  const file = resolveAuditFile(options.auditDir);
  const payload = {
    ts: new Date().toISOString(),
    event: event?.event || "unknown",
    severity: event?.severity || "info",
    decision: event?.decision || "observe",
    details: event?.details || {}
  };
  fs.appendFileSync(file, `${JSON.stringify(payload)}\n`);
  return file;
}
