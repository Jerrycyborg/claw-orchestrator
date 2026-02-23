// @ts-check
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
  }

  execution.status = "completed";
  execution.completedAt = new Date().toISOString();
  saveRun(execution);

  return execution;
}
