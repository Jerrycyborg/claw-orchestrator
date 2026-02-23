import crypto from "crypto";
import { classifyPrompt } from "./classifier.js";
import { routeIntent } from "./router.js";
import { saveRun } from "./run-store.js";
import { appendLogEntry, confidenceTag, readHandoffSnapshot, addNextAction } from "./aahp.js";
import { enforcePolicy } from "./policy.js";

export function createRun(prompt, options = {}) {
  const policy = enforcePolicy(prompt, { approveSensitive: !!options.approveSensitive });
  if (!policy.ok) {
    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      prompt,
      status: "blocked",
      policy
    };
  }

  const { intent, confidence } = classifyPrompt(prompt);
  const pipeline = routeIntent(intent);
  const handoff = readHandoffSnapshot(options.handoffDir);

  const run = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    prompt,
    intent,
    confidence,
    confidenceTag: confidenceTag(confidence),
    status: "planned",
    pipeline,
    aahp: {
      dir: handoff.dir,
      ready: handoff.ready,
      missing: handoff.missing
    },
    notes: [
      "AAHP read set: STATUS, NEXT_ACTIONS, WORKFLOW, TRUST",
      "Policy gate: block completion on high severity reviewer findings"
    ],
    policy
  };

  saveRun(run);
  return run;
}

export function syncRunToAahp(run, options = {}) {
  const now = new Date().toISOString();
  const entry = `## ${now} – Planned Run: ${run.id}\n\n- Prompt: ${run.prompt}\n- Intent: ${run.intent}\n- Confidence: ${run.confidence} (${run.confidenceTag})\n- Pipeline: ${run.pipeline.map((s) => `${s.stage}:${s.mode}:${s.roles.join("+")}`).join(" -> ")}\n- AAHP Readiness: ${run.aahp.ready ? "ready" : `missing ${run.aahp.missing.join(", ")}`}`;

  const logFile = appendLogEntry(options.handoffDir, entry);
  const nextAction = `Run ${run.id}: execute pipeline for intent '${run.intent}' and update STATUS/LOG after completion.`;
  const nextActionsFile = addNextAction(options.handoffDir, nextAction);

  return { logFile, nextActionsFile };
}
