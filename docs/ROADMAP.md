# Roadmap

## Phase 0 - Bootstrap
- [x] Repo scaffold
- [x] Initial docs
- [ ] Define config schema

## Phase 1 - Core Orchestrator
- [x] Prompt intent classifier
- [x] Pipeline router (sequential + parallel)
- [ ] Retry/escalation policy
- [x] Run state store

## Phase 2 - AAHP Integration
- [x] Read STATUS/NEXT_ACTIONS/TRUST/WORKFLOW
- [x] Write LOG/NEXT_ACTIONS updates (planned run sync)
- [x] Confidence tagging (Verified/Assumed/Unknown)
- [ ] STATUS auto-refresh on completed execution

## Phase 3 - Safety & Governance
- [ ] Security policy checks (PII/secrets)
- [ ] Approval gates for sensitive actions
- [ ] Channel policy integration

## Phase 4 - UX
- [ ] CLI: `orchestrator run`
- [ ] CLI: `orchestrator status`
- [ ] Summary output for owner
