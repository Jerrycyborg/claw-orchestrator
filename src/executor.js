import { saveRun } from "./run-store.js";
import { getRoleExecutor } from "./adapters/index.js";

export async function executeRun(run, options = {}) {
  const startedAt = new Date().toISOString();
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
      const result = await executeRole(
        {
          role,
          prompt: run.prompt,
          intent: run.intent,
          runId: run.id,
          stageMode: stage.mode
        },
        options
      );
      stageRecord.results.push(result);

      if (result.status === "failed") {
        stageRecord.status = "failed";
        stageRecord.completedAt = new Date().toISOString();
        execution.stages.push(stageRecord);
        execution.status = "failed";
        execution.completedAt = new Date().toISOString();
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
