import fs from "fs";
import path from "path";

export const REQUIRED_FILES = ["STATUS.md", "NEXT_ACTIONS.md", "WORKFLOW.md", "TRUST.md"];

export function resolveHandoffDir(inputDir) {
  const base = inputDir || ".ai/handoff";
  return path.resolve(process.cwd(), base);
}

export function readHandoffSnapshot(inputDir) {
  const dir = resolveHandoffDir(inputDir);
  const files = {};
  const missing = [];

  for (const name of REQUIRED_FILES) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) {
      files[name] = fs.readFileSync(p, "utf8");
    } else {
      files[name] = null;
      missing.push(name);
    }
  }

  return {
    dir,
    files,
    missing,
    ready: missing.length === 0
  };
}

export function appendLogEntry(inputDir, entry) {
  const dir = resolveHandoffDir(inputDir);
  fs.mkdirSync(dir, { recursive: true });
  const logFile = path.join(dir, "LOG.md");
  const previous = fs.existsSync(logFile) ? fs.readFileSync(logFile, "utf8") : "# AAHP Session Log\n\n";
  const content = `${entry}\n\n---\n\n${previous}`;
  fs.writeFileSync(logFile, content);
  return logFile;
}

export function addNextAction(inputDir, actionLine) {
  const dir = resolveHandoffDir(inputDir);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "NEXT_ACTIONS.md");
  const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "# NEXT_ACTIONS\n\n";

  const line = `- [ ] ${actionLine}`;
  const updated = `${prev.trimEnd()}\n${line}\n`;
  fs.writeFileSync(file, updated);
  return file;
}

export function confidenceTag(value) {
  if (value >= 0.8) return "Verified";
  if (value >= 0.6) return "Assumed";
  return "Unknown";
}
