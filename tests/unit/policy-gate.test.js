import { describe, it, expect } from "vitest";
import { enforcePolicy } from "../../src/policy.js";

describe("policy gate", () => {
  it("blocks obvious secret patterns", () => {
    const out = enforcePolicy("api_key=dummy_secret_value");
    expect(out.ok).toBe(false);
    expect(out.blocked).toBe(true);
  });

  it("requires approval for sensitive actions", () => {
    const out = enforcePolicy("deploy production config update");
    expect(out.ok).toBe(false);
    expect(out.requiresApproval).toBe(true);
  });

  it("allows sensitive actions with explicit approval", () => {
    const out = enforcePolicy("deploy production config update", { approveSensitive: true });
    expect(out.ok).toBe(true);
  });
});
