import assert from "assert";
import { classifyPrompt } from "./classifier.js";
import { routeIntent } from "./router.js";
import { Intents } from "./types.js";

const c1 = classifyPrompt("Please research options and compare pros cons");
assert.equal(c1.intent, Intents.RESEARCH_HEAVY);

const c2 = classifyPrompt("Implement Firestore rules and fix bug");
assert.equal(c2.intent, Intents.BUILD_CHANGE);

const c3 = classifyPrompt("security hardening and ssh firewall audit");
assert.equal(c3.intent, Intents.SECURITY_OPS);

const r = routeIntent(Intents.AMBIGUOUS_PARALLEL);
assert.equal(r[0].mode, "parallel");
assert.ok(r[0].roles.includes("researcher"));

console.log("All tests passed ✅");
