import { Intents, Roles } from "./types.js";

const DEFAULT_ROUTES = {
  [Intents.RESEARCH_HEAVY]: [Roles.RESEARCHER, Roles.ARCHITECT],
  [Intents.BUILD_CHANGE]: [Roles.ARCHITECT, Roles.IMPLEMENTER, Roles.REVIEWER],
  [Intents.SECURITY_OPS]: [Roles.OPS, Roles.REVIEWER],
  [Intents.AMBIGUOUS_PARALLEL]: [[Roles.RESEARCHER, Roles.OPS], Roles.ARCHITECT]
};

export function routeIntent(intent, overrides = {}) {
  const routes = { ...DEFAULT_ROUTES, ...overrides };
  const pipeline = routes[intent] || routes[Intents.AMBIGUOUS_PARALLEL];
  return normalizePipeline(pipeline);
}

function normalizePipeline(pipeline) {
  return pipeline.map((stage, i) => {
    if (Array.isArray(stage)) {
      return { stage: i + 1, mode: "parallel", roles: stage };
    }
    return { stage: i + 1, mode: "sequential", roles: [stage] };
  });
}
