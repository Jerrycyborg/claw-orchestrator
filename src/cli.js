#!/usr/bin/env node
import { createRun, syncRunToAahp } from "./orchestrator.js";
import { listRuns, getRun } from "./run-store.js";
import { readHandoffSnapshot } from "./aahp.js";
import { executeRun } from "./executor.js";

const args = process.argv.slice(2);
const cmd = args[0];

if (cmd === "run") {
  const prompt = readFlag(args, "--prompt") || "";
  const handoffDir = readFlag(args, "--handoff-dir") || ".ai/handoff";
  const sync = hasFlag(args, "--sync-aahp");
  const execute = hasFlag(args, "--execute");
  const execMode = readFlag(args, "--mode") || "simulate";
  const approveSensitive = hasFlag(args, "--approve-sensitive");
  const summary = hasFlag(args, "--summary");

  if (!prompt.trim()) {
    console.log("Usage: orchestrator run --prompt \"...\" [--handoff-dir <dir>] [--sync-aahp] [--approve-sensitive] [--execute] [--mode simulate|openclaw] [--summary]");
    process.exit(1);
  }
  const run = createRun(prompt, { handoffDir, approveSensitive });
  const out = { run };

  if (sync && run.status !== "blocked") out.sync = syncRunToAahp(run, { handoffDir });
  if (execute && run.status !== "blocked") out.execution = await executeRun(run, { mode: execMode });

  if (summary) {
    console.log(formatSummary(out));
  } else {
    console.log(JSON.stringify(out, null, 2));
  }
  process.exit(0);
}

if (cmd === "auto") {
  const prompt = readFlag(args, "--prompt") || "";
  const handoffDir = readFlag(args, "--handoff-dir") || ".ai/handoff";
  const approveSensitive = hasFlag(args, "--approve-sensitive");
  const summary = hasFlag(args, "--summary");

  if (!prompt.trim()) {
    console.log("Usage: orchestrator auto --prompt \"...\" [--handoff-dir <dir>] [--approve-sensitive] [--summary]");
    process.exit(1);
  }

  const run = createRun(prompt, { handoffDir, approveSensitive });
  const out = { run };

  if (run.status !== "blocked") {
    out.sync = syncRunToAahp(run, { handoffDir });
    out.execution = await executeRun(run, { mode: "openclaw" });
  }

  if (summary) {
    console.log(formatSummary(out));
  } else {
    console.log(JSON.stringify(out, null, 2));
  }
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

if (cmd === "show") {
  const id = readFlag(args, "--id");
  if (!id) {
    console.log("Usage: orchestrator show --id <run-id>");
    process.exit(1);
  }
  const run = getRun(id);
  if (!run) {
    console.log("Run not found");
    process.exit(1);
  }
  console.log(JSON.stringify(run, null, 2));
  process.exit(0);
}

if (cmd === "aahp-check") {
  const handoffDir = readFlag(args, "--handoff-dir") || ".ai/handoff";
  const snap = readHandoffSnapshot(handoffDir);
  console.log(JSON.stringify(snap, null, 2));
  process.exit(0);
}

console.log("Usage:\n  orchestrator auto --prompt \"...\" [--handoff-dir <dir>] [--approve-sensitive] [--summary]\n  orchestrator run --prompt \"...\" [--handoff-dir <dir>] [--sync-aahp] [--approve-sensitive] [--execute] [--mode simulate|openclaw] [--summary]\n  orchestrator status\n  orchestrator show --id <run-id>\n  orchestrator aahp-check [--handoff-dir <dir>]");

function readFlag(argv, flag) {
  const idx = argv.indexOf(flag);
  if (idx === -1) return null;
  return argv[idx + 1] ?? null;
}

function hasFlag(argv, flag) {
  return argv.includes(flag);
}

function formatSummary(out) {
  const run = out.run || {};
  if (run.status === "blocked") {
    return [
      `❌ Run blocked`,
      `Run ID: ${run.id}`,
      `Reason: ${run.policy?.reason || "policy gate"}`
    ].join("\n");
  }

  const ex = out.execution || {};
  const lines = [
    `✅ Run ${ex.status || run.status}`,
    `Run ID: ${run.id}`,
    `Intent: ${run.intent || "n/a"}`,
    `Confidence: ${run.confidenceTag || "n/a"} (${run.confidence ?? "n/a"})`,
    `Mode: ${ex.executionMode || "n/a"}`,
    `Stages:`
  ];

  for (const s of ex.stages || []) {
    const roles = (s.results || []).map((r) => `${r.role}:${r.status}`).join(", ");
    lines.push(`- stage ${s.stage} [${s.mode}] ${roles}`);
  }

  return lines.join("\n");
}
