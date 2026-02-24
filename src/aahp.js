import fs from "fs";
import path from "path";

export const REQUIRED_FILES = ["STATUS.md", "NEXT_ACTIONS.md", "WORKFLOW.md", "TRUST.md"];

export function resolveHandoffDir(inputDir) {
  const base = inputDir || ".ai/handoff";
  return path.resolve(process.cwd(), base);
}

function validateHandoffFile(name, content) {
  if (typeof content !== "string") return `Invalid type for ${name}`;
  if (content.length > 200_000) return `${name} exceeds max allowed size`;

  if (name === "NEXT_ACTIONS.md") {
    const lines = content.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      const ok =
        line.startsWith("#") || /^\s*-\s*\[(\s|x)\]\s+/.test(line) || /^\s*---\s*$/.test(line);
      if (!ok) return "NEXT_ACTIONS.md contains invalid line format";
    }
  }

  if (name === "STATUS.md" && !content.includes("# STATUS")) {
    return "STATUS.md missing required '# STATUS' heading";
  }

  return null;
}

export function readHandoffSnapshot(inputDir) {
  const dir = resolveHandoffDir(inputDir);
  const files = {};
  const missing = [];
  const validationErrors = {};

  for (const name of REQUIRED_FILES) {
    const p = path.join(dir, name);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf8");
      files[name] = content;
      const err = validateHandoffFile(name, content);
      if (err) validationErrors[name] = err;
    } else {
      files[name] = null;
      missing.push(name);
    }
  }

  return {
    dir,
    files,
    missing,
    validationErrors,
    ready: missing.length === 0 && Object.keys(validationErrors).length === 0
  };
}

export function appendLogEntry(inputDir, entry) {
  const dir = resolveHandoffDir(inputDir);
  fs.mkdirSync(dir, { recursive: true });
  const logFile = path.join(dir, "LOG.md");
  const previous = fs.existsSync(logFile)
    ? fs.readFileSync(logFile, "utf8")
    : "# AAHP Session Log\n\n";
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

export function updateStatusWithRun(inputDir, run) {
  const dir = resolveHandoffDir(inputDir);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "STATUS.md");
  const prev = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "# STATUS\n\n";

  const markerStart = "<!-- ORCHESTRATOR_LAST_RUN_START -->";
  const markerEnd = "<!-- ORCHESTRATOR_LAST_RUN_END -->";
  const block = `${markerStart}\n## Orchestrator Last Run\n- Run ID: ${run.id}\n- Status: ${run.status}\n- Intent: ${run.intent || "n/a"}\n- Completed At: ${run.completedAt || new Date().toISOString()}\n${markerEnd}`;

  let next = prev;
  const startIdx = prev.indexOf(markerStart);
  const endIdx = prev.indexOf(markerEnd);
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const tailStart = endIdx + markerEnd.length;
    next = `${prev.slice(0, startIdx).trimEnd()}\n\n${block}\n${prev.slice(tailStart)}`;
  } else {
    next = `${prev.trimEnd()}\n\n---\n\n${block}\n`;
  }

  fs.writeFileSync(file, next);
  return file;
}
