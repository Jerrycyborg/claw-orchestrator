#!/usr/bin/env node
import { createRun } from "./orchestrator.js";
import { listRuns } from "./run-store.js";

const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === "run") {
  const prompt = readFlag(args, "--prompt") || "";
  if (!prompt.trim()) {
    console.log("Usage: orchestrator run --prompt \"...\"");
    process.exit(1);
  }
  const run = createRun(prompt);
  console.log(JSON.stringify(run, null, 2));
  process.exit(0);
}

if (cmd === "status") {
  const runs = listRuns(10);
  if (!runs.length) {
    console.log("No runs yet.");
    process.exit(0);
  }
  for (const r of runs) {
    console.log(`- ${r.id} | ${r.intent} | conf=${r.confidence} | ${r.createdAt}`);
  }
  process.exit(0);
}

console.log("Usage:\n  orchestrator run --prompt \"...\"\n  orchestrator status");

function readFlag(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1) return null;
  return argv[idx + 1] ?? null;
}
