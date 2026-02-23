#!/usr/bin/env node
import { createRun, syncRunToAahp } from "./orchestrator.js";
import { listRuns } from "./run-store.js";
import { readHandoffSnapshot } from "./aahp.js";

const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === "run") {
  const prompt = readFlag(args, "--prompt") || "";
  const handoffDir = readFlag(args, "--handoff-dir") || ".ai/handoff";
  const sync = hasFlag(args, "--sync-aahp");
  const approveSensitive = hasFlag(args, "--approve-sensitive");

  if (!prompt.trim()) {
    console.log("Usage: orchestrator run --prompt \"...\" [--handoff-dir <dir>] [--sync-aahp] [--approve-sensitive]");
    process.exit(1);
  }
  const run = createRun(prompt, { handoffDir, approveSensitive });
  const out = { run };

  if (sync && run.status !== "blocked") {
    out.sync = syncRunToAahp(run, { handoffDir });
  }

  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}

if (cmd === "status") {
  const runs = listRuns(10);
  if (!runs.length) {
    console.log("No runs yet.");
    process.exit(0);
  }
  for (const r of runs) {
    console.log(`- ${r.id} | ${r.status} | ${r.intent || "n/a"} | conf=${r.confidence ?? "n/a"} (${r.confidenceTag || "n/a"}) | ${r.createdAt}`);
  }
  process.exit(0);
}

if (cmd === "aahp-check") {
  const handoffDir = readFlag(args, "--handoff-dir") || ".ai/handoff";
  const snap = readHandoffSnapshot(handoffDir);
  console.log(JSON.stringify(snap, null, 2));
  process.exit(0);
}

console.log("Usage:\n  orchestrator run --prompt \"...\" [--handoff-dir <dir>] [--sync-aahp] [--approve-sensitive]\n  orchestrator status\n  orchestrator aahp-check [--handoff-dir <dir>]");

function readFlag(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1) return null;
  return argv[idx + 1] ?? null;
}

function hasFlag(argv, flag) {
  return argv.includes(flag);
}
