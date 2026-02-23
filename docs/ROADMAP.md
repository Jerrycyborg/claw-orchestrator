# Roadmap

## Phase 0 - Bootstrap
- [x] Repo scaffold
- [x] Initial docs
- [ ] Define config schema

## Phase 1 - Core Orchestrator
- [x] Prompt intent classifier
- [x] Pipeline router (sequential + parallel)
- [x] Retry/escalation policy (per-role retries + escalation notes)
- [x] Run state store

## Phase 2 - AAHP Integration
- [x] Read STATUS/NEXT_ACTIONS/TRUST/WORKFLOW
- [x] Write LOG/NEXT_ACTIONS updates (planned run sync)
- [x] Confidence tagging (Verified/Assumed/Unknown)
- [x] STATUS auto-refresh on completed execution (last-run marker block)

## Phase 3 - Safety & Governance
- [x] Security policy checks (PII/secrets) at prompt gate
- [x] Approval gates for sensitive actions (`--approve-sensitive`)
- [x] Channel policy integration (direct vs group gate before execution)

## Phase 4 - UX
- [x] CLI: `orchestrator run`
- [x] CLI: `orchestrator status`
- [x] CLI: `orchestrator show --id <run-id>`
- [x] Summary output for owner (`--summary`, hook summary)

## Phase 5 - Execution Runtime
- [x] Run state transitions (planned/running/completed/blocked)
- [x] Stateless role executor adapter (simulation)
- [x] OpenClaw adapter bridge (`--mode openclaw` + command template)
- [x] Session-event hook entrypoint (`orchestrator hook`) for native plugin wiring path
- [ ] Native OpenClaw API integration (without shell bridge)
