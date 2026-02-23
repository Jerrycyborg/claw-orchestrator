export type ExecutionMode = "simulate" | "openclaw";
export type Intent = "research_heavy" | "build_change" | "security_ops" | "ambiguous_parallel";

export interface PipelineStage {
  stage: number;
  mode: "parallel" | "sequential";
  roles: string[];
}

export interface RunRecord {
  id: string;
  prompt: string;
  status: string;
  intent?: Intent;
  pipeline?: PipelineStage[];
  [key: string]: any;
}

export interface ExecuteOptions {
  mode?: ExecutionMode;
  simulateDelayMs?: number;
  [key: string]: any;
}

declare module "./types.js" {
  export const Roles: Record<string, string>;
  export const Intents: Record<string, Intent>;
}
