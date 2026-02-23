import crypto from "crypto";
import { classifyPrompt } from "./classifier.js";
import { routeIntent } from "./router.js";
import { saveRun } from "./run-store.js";
import { appendLogEntry, confidenceTag, readHandoffSnapshot, addNextAction } from "./aahp.js";
import { enforcePolicy } from "./policy.js";
import { enforceChannelPolicy } from "./channel-policy.js";
import { loadOrchestratorConfig } from "./config.js";

export function createRun(prompt, options = {}) {
  const loaded = loadOrchestratorConfig();
  const runtimeConfig = loaded.config;

  const policy = enforcePolicy(prompt, { approveSensitive: !!options.approveSensitive });
  const channelPolicy = enforceChannelPolicy(options.channelContext, {
    approveSensitive: !!options.approveSensitive,
    channelPolicy: options.channelPolicy || runtimeConfig.channelPolicy
  });

  if (!policy.ok || !channelPolicy.ok) {
    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      prompt,
      status: "blocked",
      policy,
      channelPolicy,
      configSource: loaded.source
    };
  }

  const { intent, confidence } = classifyPrompt(prompt);
  const threshold = Number(runtimeConfig.policy?.require_confidence_threshold ?? 0);
  if (threshold > 0 && confidence < threshold) {
    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      prompt,
      status: "blocked",
      policy: {
        ok: false,
        blocked: true,
        reason: `Classifier confidence ${confidence.toFixed(2)} below threshold ${threshold.toFixed(2)}`,
        findings: [{ severity: "medium", type: "confidence-threshold", confidence, threshold }]
      },
      channelPolicy,
      configSource: loaded.source
    };
  }

  const pipeline = routeIntent(intent, runtimeConfig.routing || {});
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
      runtimeConfig.policy?.block_on_high_severity
        ? "Policy gate: block completion on high severity reviewer findings"
        : "Policy gate: high severity reviewer findings are advisory"
    ],
    policy,
    channelPolicy,
    channelContext: channelPolicy.channelContext,
    configSource: loaded.source,
    runtimePolicy: runtimeConfig.policy
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
