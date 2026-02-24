import fs from "fs";
import path from "path";

const RUN_DIR = path.resolve(process.cwd(), ".orchestrator", "runs");

export function saveRun(run) {
  fs.mkdirSync(RUN_DIR, { recursive: true });
  const file = path.join(RUN_DIR, `${run.id}.json`);
  fs.writeFileSync(file, JSON.stringify(run, null, 2));
  return file;
}

export function getRun(id) {
  const file = path.join(RUN_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function listRuns(limit = 10) {
  if (!fs.existsSync(RUN_DIR)) return [];
  const files = fs
    .readdirSync(RUN_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(RUN_DIR, f));

  return files
    .map((f) => ({ file: f, mtime: fs.statSync(f).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, limit)
    .map(({ file }) => JSON.parse(fs.readFileSync(file, "utf8")));
}
