import crypto from "crypto";
import { classifyPrompt } from "./classifier.js";
import { routeIntent } from "./router.js";
import { saveRun } from "./run-store.js";

export function createRun(prompt) {
  const { intent, confidence } = classifyPrompt(prompt);
  const pipeline = routeIntent(intent);

  const run = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    prompt,
    intent,
    confidence,
    status: "planned",
    pipeline,
    notes: [
      "AAHP read set: STATUS, NEXT_ACTIONS, WORKFLOW, TRUST",
      "Policy gate: block completion on high severity reviewer findings"
    ]
  };

  saveRun(run);
  return run;
}
