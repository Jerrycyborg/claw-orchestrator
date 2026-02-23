import assert from "assert";
import fs from "fs";
import path from "path";
import os from "os";
import { classifyPrompt } from "./classifier.js";
import { routeIntent } from "./router.js";
import { Intents } from "./types.js";
import { createRun, syncRunToAahp } from "./orchestrator.js";
import { readHandoffSnapshot, confidenceTag } from "./aahp.js";

const c1 = classifyPrompt("Please research options and compare pros cons");
assert.equal(c1.intent, Intents.RESEARCH_HEAVY);

const c2 = classifyPrompt("Implement Firestore rules and fix bug");
assert.equal(c2.intent, Intents.BUILD_CHANGE);

const c3 = classifyPrompt("security hardening and ssh firewall audit");
assert.equal(c3.intent, Intents.SECURITY_OPS);

const r = routeIntent(Intents.AMBIGUOUS_PARALLEL);
assert.equal(r[0].mode, "parallel");
assert.ok(r[0].roles.includes("researcher"));

assert.equal(confidenceTag(0.9), "Verified");
assert.equal(confidenceTag(0.7), "Assumed");
assert.equal(confidenceTag(0.4), "Unknown");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "orch-"));
const handoff = path.join(tmp, ".ai", "handoff");
fs.mkdirSync(handoff, { recursive: true });
for (const f of ["STATUS.md", "NEXT_ACTIONS.md", "WORKFLOW.md", "TRUST.md"]) {
  fs.writeFileSync(path.join(handoff, f), `# ${f}`);
}

const snap = readHandoffSnapshot(handoff);
assert.equal(snap.ready, true);

const run = createRun("Implement feature with security review", { handoffDir: handoff });
assert.ok(run.aahp.ready);

const synced = syncRunToAahp(run, { handoffDir: handoff });
assert.ok(fs.existsSync(synced.logFile));
assert.ok(fs.existsSync(synced.nextActionsFile));

console.log("All tests passed ✅");
