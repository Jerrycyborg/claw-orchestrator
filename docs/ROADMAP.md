# Roadmap

## Phase 0 - Bootstrap
- [x] Repo scaffold
- [x] Initial docs
- [ ] Define config schema

## Phase 1 - Core Orchestrator
- [ ] Prompt intent classifier
- [ ] Pipeline router (sequential + parallel)
- [ ] Retry/escalation policy
- [ ] Run state store

## Phase 2 - AAHP Integration
- [ ] Read STATUS/NEXT_ACTIONS/TRUST/WORKFLOW
- [ ] Write LOG/STATUS/NEXT_ACTIONS updates
- [ ] Confidence tagging (Verified/Assumed/Unknown)

## Phase 3 - Safety & Governance
- [ ] Security policy checks (PII/secrets)
- [ ] Approval gates for sensitive actions
- [ ] Channel policy integration

## Phase 4 - UX
- [ ] CLI: `orchestrator run`
- [ ] CLI: `orchestrator status`
- [ ] Summary output for owner
