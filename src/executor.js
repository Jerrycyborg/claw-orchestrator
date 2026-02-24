// @ts-check
import { execSync } from "child_process";
import { saveRun } from "./run-store.js";
import { getRoleExecutor } from "./adapters/index.js";

/**
 * @typedef {import("./types.d.ts").RunRecord} RunRecord
 * @typedef {import("./types.d.ts").ExecuteOptions} ExecuteOptions
 */

/**
 * @param {RunRecord} run
 * @param {ExecuteOptions} [options]
 */
export async function executeRun(run, options = {}) {
  const startedAt = new Date().toISOString();
  /** @type {any} */
  const execution = {
    ...run,
    status: "running",
    startedAt,
    executionMode: options.mode || "simulate",
    stages: []
  };

  const executeRole = getRoleExecutor(options.mode);
  const autoRemediate = options.autoRemediate !== false;
  let remediationPasses = 0;
  const repoEvidenceBefore = captureRepoEvidence(run.prompt);
  saveRun(execution);

  for (const stage of run.pipeline || []) {
    const stageRecord = {
      stage: stage.stage,
      mode: stage.mode,
      roles: stage.roles,
      status: "running",
      startedAt: new Date().toISOString(),
      results: []
    };

    for (const role of stage.roles) {
      const maxRetries = Number(options.maxRetries ?? 1);
      let attempt = 0;
      /** @type {any} */
      let result = null;

      while (attempt <= maxRetries) {
        result = await executeRole(
          /** @type {any} */ ({
            role,
            prompt: run.prompt,
            intent: run.intent,
            runId: run.id,
            stageMode: stage.mode,
            attempt
          }),
          options
        );

        if (result.status !== "failed") break;
        attempt += 1;
      }

      if (result) result.attempts = attempt + 1;
      stageRecord.results.push(result);

      if (result && result.status === "failed") {
        stageRecord.status = "failed";
        stageRecord.completedAt = new Date().toISOString();
        stageRecord.escalation = `Role '${role}' failed after ${attempt + 1} attempt(s)`;
        execution.stages.push(stageRecord);
        execution.status = "failed";
        execution.completedAt = new Date().toISOString();
        execution.escalation = stageRecord.escalation;
        saveRun(execution);
        return execution;
      }
    }

    stageRecord.status = "completed";
    stageRecord.completedAt = new Date().toISOString();
    execution.stages.push(stageRecord);
    saveRun(execution);

    if (autoRemediate && remediationPasses < 1 && shouldAutoRemediate(stageRecord)) {
      remediationPasses += 1;
      const remediationPrompt = buildRemediationPrompt(run.prompt, stageRecord);

      for (const role of ["implementer", "reviewer"]) {
        const remStage = {
          stage: execution.stages.length + 1,
          mode: "sequential",
          roles: [role],
          status: "running",
          startedAt: new Date().toISOString(),
          remediation: true,
          results: []
        };

        const result = await executeRole(
          /** @type {any} */ ({
            role,
            prompt: remediationPrompt,
            intent: run.intent,
            runId: run.id,
            stageMode: "sequential",
            attempt: 0
          }),
          options
        );

        result.attempts = 1;
        remStage.results.push(result);

        if (result && result.status === "failed") {
          remStage.status = "failed";
          remStage.completedAt = new Date().toISOString();
          remStage.escalation = `Auto-remediation role '${role}' failed`;
          execution.stages.push(remStage);
          execution.status = "failed";
          execution.completedAt = new Date().toISOString();
          execution.escalation = remStage.escalation;
          saveRun(execution);
          return execution;
        }

        remStage.status = "completed";
        remStage.completedAt = new Date().toISOString();
        execution.stages.push(remStage);
        saveRun(execution);

        if (role === "reviewer" && shouldAutoRemediate(remStage)) {
          execution.status = "failed";
          execution.completedAt = new Date().toISOString();
          execution.escalation =
            "Auto-remediation completed but reviewer still reports high-severity/no-go findings";
          saveRun(execution);
          return execution;
        }
      }
    }
  }

  const repoEvidenceAfter = captureRepoEvidence(run.prompt);
  const evidenceGate = evaluateEvidenceGate(run.prompt, repoEvidenceBefore, repoEvidenceAfter);
  if (!evidenceGate.ok) {
    execution.status = "failed";
    execution.completedAt = new Date().toISOString();
    execution.escalation = evidenceGate.reason;
    execution.evidence = {
      before: repoEvidenceBefore,
      after: repoEvidenceAfter
    };
    saveRun(execution);
    return execution;
  }

  execution.status = "completed";
  execution.completedAt = new Date().toISOString();
  execution.evidence = {
    before: repoEvidenceBefore,
    after: repoEvidenceAfter
  };
  saveRun(execution);

  return execution;
}

function shouldAutoRemediate(stageRecord) {
  const hasReviewer = (stageRecord.roles || []).includes("reviewer");
  if (!hasReviewer) return false;

  const text = (stageRecord.results || [])
    .map((r) => `${r?.output || ""} ${r?.error || ""}`)
    .join("\n")
    .toLowerCase();

  if (!text.trim()) return false;
  return (
    text.includes("no_go") ||
    text.includes("no-go") ||
    text.includes("high") ||
    text.includes("critical")
  );
}

function buildRemediationPrompt(basePrompt, stageRecord) {
  const reviewerText = (stageRecord.results || [])
    .map((r) => `${r?.output || ""} ${r?.error || ""}`)
    .join("\n")
    .slice(0, 4000);

  return [
    basePrompt,
    "",
    "Auto-remediation instruction:",
    "Fix all high-severity and no-go findings from reviewer output below, then rerun required validations and provide concise changed-files and residual risks.",
    "",
    "Reviewer findings:",
    reviewerText
  ].join("\n");
}

function captureRepoEvidence(prompt) {
  const repoPath = inferRepoPath(prompt);
  if (!repoPath) return null;

  try {
    const head = execSync("git rev-parse HEAD", { cwd: repoPath, encoding: "utf8" }).trim();
    const short = execSync("git status --short", { cwd: repoPath, encoding: "utf8" }).trim();
    return { repoPath, head, dirty: !!short };
  } catch {
    return null;
  }
}

function inferRepoPath(prompt = "") {
  const p = String(prompt).toLowerCase();
  if (p.includes("openclaw-edgemesh") || p.includes("edgemesh")) {
    return "/home/barboza/.openclaw/workspace/openclaw-edgemesh";
  }
  return null;
}

function evaluateEvidenceGate(prompt = "", before, after) {
  const p = String(prompt).toLowerCase();
  const requiresCodeChange = ["implement", "build", "wire", "add", "fix", "commit"].some((w) =>
    p.includes(w)
  );

  if (!requiresCodeChange) return { ok: true };
  if (!before || !after) return { ok: true };

  const changed = before.head !== after.head || before.dirty !== after.dirty;
  if (changed) return { ok: true };

  return {
    ok: false,
    reason:
      "Execution reported success but produced no repository evidence (no commit/state change)."
  };
}
