import { saveRun } from "./run-store.js";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeRun(run, options = {}) {
  const startedAt = new Date().toISOString();
  const execution = {
    ...run,
    status: "running",
    startedAt,
    stages: []
  };

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

    // Stateless simulation hook (replace with real adapter in next iteration)
    for (const role of stage.roles) {
      await wait(options.simulateDelayMs ?? 50);
      stageRecord.results.push({
        role,
        status: "ok",
        note: `Executed role '${role}' in ${stage.mode} mode (simulated)`
      });
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
