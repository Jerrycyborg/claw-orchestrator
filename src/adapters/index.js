import { executeRole as simulateRole } from "./simulate-adapter.js";
import { executeRole as openclawRole } from "./openclaw-adapter.js";

export function getRoleExecutor(mode = "simulate") {
  if (mode === "openclaw") return openclawRole;
  return simulateRole;
}
