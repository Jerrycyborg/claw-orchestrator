---
name: claw-orchestrator
description: Automatically orchestrate multi-role execution (researcher, architect, implementer, reviewer, ops) from natural user prompts. Use when the user asks to execute a task end-to-end, coordinate multiple agents, run AAHP-style handoffs, or wants one-command orchestration with concise summaries.
---

Use this workflow:
1. Preferred for session-event integration: run `scripts/hook-dispatch.sh` with event JSON on stdin (or `--event-file`) so channel context is enforced.
2. Fallback manual mode: run `scripts/orchestrate.sh "<user prompt>"`.
3. Return concise summary output to user.
4. If blocked by policy, explain what approval is required.
5. If successful, show run id + stage outcomes + next action.

Read `references/usage.md` when needed.
