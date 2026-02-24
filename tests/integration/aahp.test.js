import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";
import { readHandoffSnapshot, confidenceTag } from "../../src/aahp.js";

function createHandoffDir() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "orch-aahp-"));
  const handoff = path.join(tmp, ".ai", "handoff");
  fs.mkdirSync(handoff, { recursive: true });
  return handoff;
}

describe("AAHP integration", () => {
  it("marks snapshot ready when required files are valid", () => {
    const handoff = createHandoffDir();
    fs.writeFileSync(path.join(handoff, "STATUS.md"), "# STATUS\n");
    fs.writeFileSync(path.join(handoff, "NEXT_ACTIONS.md"), "# NEXT_ACTIONS\n- [ ] one task\n");
    fs.writeFileSync(path.join(handoff, "WORKFLOW.md"), "# WORKFLOW\n");
    fs.writeFileSync(path.join(handoff, "TRUST.md"), "# TRUST\n");

    const snap = readHandoffSnapshot(handoff);
    expect(snap.ready).toBe(true);
    expect(snap.missing.length).toBe(0);
  });

  it("flags invalid NEXT_ACTIONS format", () => {
    const handoff = createHandoffDir();
    fs.writeFileSync(path.join(handoff, "STATUS.md"), "# STATUS\n");
    fs.writeFileSync(path.join(handoff, "NEXT_ACTIONS.md"), "INVALID LINE\n");
    fs.writeFileSync(path.join(handoff, "WORKFLOW.md"), "# WORKFLOW\n");
    fs.writeFileSync(path.join(handoff, "TRUST.md"), "# TRUST\n");

    const snap = readHandoffSnapshot(handoff);
    expect(snap.ready).toBe(false);
    expect(Boolean(snap.validationErrors["NEXT_ACTIONS.md"])).toBe(true);
  });

  it("returns stable confidence tags", () => {
    expect(confidenceTag(0.9)).toBe("Verified");
    expect(confidenceTag(0.7)).toBe("Assumed");
    expect(confidenceTag(0.4)).toBe("Unknown");
  });
});
