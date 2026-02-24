import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { createRun } from "../../src/orchestrator.js";
import { executeRun } from "../../src/executor.js";

function setupValidHandoff() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "orch-e2e-"));
  const handoff = path.join(tmp, ".ai", "handoff");
  fs.mkdirSync(handoff, { recursive: true });
  fs.writeFileSync(path.join(handoff, "STATUS.md"), "# STATUS\n");
  fs.writeFileSync(path.join(handoff, "NEXT_ACTIONS.md"), "# NEXT_ACTIONS\n- [ ] seed\n");
  fs.writeFileSync(path.join(handoff, "WORKFLOW.md"), "# WORKFLOW\n");
  fs.writeFileSync(path.join(handoff, "TRUST.md"), "# TRUST\n");
  return handoff;
}

describe("orchestrator e2e (simulated adapter)", () => {
  it("plans and executes a run end-to-end", async () => {
    const handoffDir = setupValidHandoff();
    const run = createRun("Implement build pipeline improvements", {
      handoffDir,
      approveSensitive: true
    });

    expect(run.status).toBe("planned");
    expect(Array.isArray(run.pipeline)).toBe(true);
    expect(run.pipeline.length).toBeGreaterThan(0);

    const executed = await executeRun(run, { mode: "simulate", simulateDelayMs: 1 });
    expect(executed.status).toBe("completed");
    expect(executed.executionMode).toBe("simulate");
    expect(executed.stages.length).toBeGreaterThan(0);
    expect(executed.stages.every((s) => s.status === "completed")).toBe(true);
  });
});
