import { describe, it, expect } from "vitest";
import { routeIntent } from "../../src/router.js";
import { Intents } from "../../src/types.js";

describe("router", () => {
  it("returns parallel first stage for ambiguous_parallel", () => {
    const pipeline = routeIntent(Intents.AMBIGUOUS_PARALLEL);
    expect(pipeline[0].mode).toBe("parallel");
    expect(pipeline[0].roles).toContain("researcher");
  });

  it("returns architect->implementer->reviewer for build_change", () => {
    const pipeline = routeIntent(Intents.BUILD_CHANGE);
    expect(pipeline.map((s) => s.roles[0])).toEqual(["architect", "implementer", "reviewer"]);
  });
});
