import { describe, it, expect } from "vitest";
import { classifyPrompt } from "../../src/classifier.js";
import { Intents } from "../../src/types.js";

describe("classifier", () => {
  it("classifies research-heavy prompts", () => {
    const out = classifyPrompt("research options and compare pros cons");
    expect(out.intent).toBe(Intents.RESEARCH_HEAVY);
    expect(out.confidence).toBeGreaterThan(0.6);
  });

  it("classifies build-change prompts", () => {
    const out = classifyPrompt("implement feature and fix bug");
    expect(out.intent).toBe(Intents.BUILD_CHANGE);
  });

  it("classifies security-ops prompts", () => {
    const out = classifyPrompt("security hardening firewall ssh audit");
    expect(out.intent).toBe(Intents.SECURITY_OPS);
  });
});
