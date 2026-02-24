# Architecture

## Overview

`claw-orchestrator` turns one prompt into a role pipeline:

1. classify intent
2. choose route
3. execute roles
4. log run state
5. sync handoff files

## Core modules

- `src/classifier.js` — maps prompt to intent + confidence.
- `src/router.js` — builds stage plan (sequential/parallel role sets).
- `src/executor.js` — executes pipeline with retries and escalation.
- `src/adapters/*` — execution backends:
  - `simulate` for deterministic local runs
  - `openclaw` for native OpenClaw dispatch (API/CLI, legacy shell fallback)
- `src/aahp.js` — handoff read/write (`STATUS.md`, `NEXT_ACTIONS.md`, `LOG.md`).
- `src/policy.js` + `src/channel-policy.js` — safety and channel gating.

## Run lifecycle

1. `createRun()` builds run metadata and pipeline.
2. Optional AAHP sync writes planned run context.
3. `executeRun()` processes each stage and role.
4. On failure, run is marked failed with escalation note.
5. On completion, status is updated and run is persisted.

## Execution modes

- `simulate` (safe local default)
- `openclaw` (preferred for real role execution)

## Key design choices

- Stateless role execution first (predictable, easier recovery)
- Strict policy gates before execution
- Explicit run artifacts for auditability
