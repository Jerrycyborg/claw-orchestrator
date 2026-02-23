# claw-orchestrator

🧠 Multi-agent orchestration layer for OpenClaw.

## Goal
Coordinate role-based agent pipelines (Researcher, Architect, Implementer, Reviewer, Ops) from a single prompt with clear routing, handoffs, and auditability.

## MVP Scope
- Prompt classifier → route to role pipeline
- AAHP-compatible handoff writer
- Run trace log (who did what, when)
- Policy hooks (block on high-risk findings)
- Simple CLI to start/inspect runs

## Project Structure
- `docs/` architecture, roadmap, decisions
- `src/` orchestrator core
- `config/` routing and policy configs
- `scripts/` developer utilities

## Status
MVP bootstrap initialized.
