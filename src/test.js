import assert from "assert";
import fs from "fs";
import path from "path";
import os from "os";
import { classifyPrompt } from "./classifier.js";
import { routeIntent } from "./router.js";
import { Intents } from "./types.js";
import { createRun, syncRunToAahp } from "./orchestrator.js";
import { readHandoffSnapshot, confidenceTag } from "./aahp.js";
import { enforcePolicy } from "./policy.js";
import { executeRun } from "./executor.js";
import { enforceChannelPolicy } from "./channel-policy.js";
import { eventToRunInput } from "./session-hook.js";
import { resolveDispatchPlan } from "./adapters/openclaw-adapter.js";

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

fs.writeFileSync(path.join(handoff, "NEXT_ACTIONS.md"), "INVALID LINE WITHOUT CHECKBOX\n");
const invalidSnap = readHandoffSnapshot(handoff);
assert.equal(invalidSnap.ready, false);
assert.ok(invalidSnap.validationErrors["NEXT_ACTIONS.md"]);
fs.writeFileSync(path.join(handoff, "NEXT_ACTIONS.md"), "# NEXT_ACTIONS\n- [ ] test\n");

const run = createRun("Implement feature, build code, and fix bug", {
  handoffDir: handoff,
  approveSensitive: true
});
assert.ok(run.aahp.ready);

const blockedNoApproval = createRun("Deploy production config update", { handoffDir: handoff });
assert.equal(blockedNoApproval.status, "blocked");

const blockedGroupChannel = createRun("Create task plan", {
  handoffDir: handoff,
  channelContext: { kind: "group" }
});
assert.equal(blockedGroupChannel.status, "blocked");

const groupApproved = enforceChannelPolicy(
  { kind: "group" },
  { approveSensitive: true, channelPolicy: { group: { allowed: true, requiresApproval: true } } }
);
assert.equal(groupApproved.ok, true);

const hookInput = eventToRunInput({
  message: { text: "Do release prep" },
  channelType: "dm",
  id: "evt1"
});
assert.equal(hookInput.prompt, "Do release prep");
assert.equal(hookInput.channelContext.kind, "dm");

const policySecret = enforcePolicy("api_key=dummy_secret_value");
assert.equal(policySecret.ok, false);

createRun("api_key=test_secret_value", { handoffDir: handoff });
const auditFile = path.join(handoff, "AUDIT.log.jsonl");
assert.ok(fs.existsSync(auditFile));
const auditLines = fs.readFileSync(auditFile, "utf8").trim().split(/\r?\n/);
assert.ok(auditLines.length >= 1);

assert.equal(
  resolveDispatchPlan({ OPENCLAW_API_URL: "http://localhost:8080" }, false),
  "native-api"
);
assert.equal(resolveDispatchPlan({}, true), "native-cli");
assert.equal(resolveDispatchPlan({ OPENCLAW_ROLE_CMD: "echo hi" }, false), "legacy-shell-bridge");
assert.equal(resolveDispatchPlan({}, false), "unavailable");

const synced = syncRunToAahp(run, { handoffDir: handoff });
assert.ok(fs.existsSync(synced.logFile));
assert.ok(fs.existsSync(synced.nextActionsFile));

const executed = await executeRun(run, { simulateDelayMs: 1, mode: "simulate" });
assert.equal(executed.status, "completed");
assert.ok(Array.isArray(executed.stages));
assert.ok(executed.stages.length >= 1);
assert.equal(executed.executionMode, "simulate");

console.log("All tests passed ✅");
