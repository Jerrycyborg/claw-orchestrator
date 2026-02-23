// @ts-check
import { executeRole as simulateRole } from "./simulate-adapter.js";
import { executeRole as openclawRole } from "./openclaw-adapter.js";

/** @typedef {import("../types.d.ts").ExecutionMode} ExecutionMode */

/**
 * @param {ExecutionMode} [mode]
 */
export function getRoleExecutor(mode = "simulate") {
  if (mode === "openclaw") return openclawRole;
  return simulateRole;
}
