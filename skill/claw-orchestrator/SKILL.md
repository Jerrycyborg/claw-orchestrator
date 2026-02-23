---
name: claw-orchestrator
description: Automatically orchestrate multi-role execution (researcher, architect, implementer, reviewer, ops) from natural user prompts. Use when the user asks to execute a task end-to-end, coordinate multiple agents, run AAHP-style handoffs, or wants one-command orchestration with concise summaries.
---

Use this workflow:
1. Run `scripts/orchestrate.sh "<user prompt>"`.
2. Return concise summary output to user.
3. If blocked by policy, explain what approval is required.
4. If successful, show run id + stage outcomes + next action.

Read `references/usage.md` when needed.
