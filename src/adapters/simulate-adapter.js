function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeRole({ role, stageMode }, options = {}) {
  await wait(options.simulateDelayMs ?? 50);
  return {
    role,
    status: "ok",
    adapter: "simulate",
    note: `Executed role '${role}' in ${stageMode} mode (simulated)`
  };
}
