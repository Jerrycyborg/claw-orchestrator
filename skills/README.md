# claw role skills

The five `claw-orchestrator` roles as **runtime-free agent skills**, plus a
pipeline skill that routes between them.

Same roles, same routing table, same policy gates as `config/orchestrator.yaml`
and `src/policy.js` — but as instructions rather than a Node process, so they
work in Claude Code and the Codex CLI on any machine, with no checkout and no
orchestrator running.

| Skill | Role |
|---|---|
| `/claw-run` | Classify intent → route → run stages → report. The entry point. |
| `/claw-researcher` | Options, prior art, build-vs-adopt, recommendation with risks |
| `/claw-architect` | Decomposition, contracts, data flow, failure modes, test matrix |
| `/claw-implementer` | Build it, test it, hold the scope |
| `/claw-reviewer` | Correctness + security, severity-classified, go/no-go |
| `/claw-ops` | Rollout, pre-flight, what to watch, rollback, go/no-go |

## Install

```bash
./install.sh                 # auto-detects ~/.claude and ~/.codex
./install.sh --host claude
./install.sh --host codex
./install.sh --uninstall
```

Copies into `~/.claude/skills/` and/or `${CODEX_HOME:-~/.codex}/skills/`.
Re-run after pulling changes. Nothing to build, no dependencies.

## Skill path vs runtime path

Both honour the same gates. They differ in what they can prove afterwards.

| | Skill path (this) | Node path (`scripts/orchestrate.sh`) |
|---|---|---|
| Needs a checkout | no | yes |
| Needs Node | no | yes |
| Works in Codex / other agents | yes | via adapter only |
| Policy gates | enforced by instruction | enforced in code |
| Run IDs, audit ledger, traces | no | yes |
| Dashboard | no | yes |

Use the runtime path when the audit trail matters. Use this one everywhere else.

## Data handling

Every skill carries `references/data-handling.md` and is instructed to run its
pre-flight first. It mirrors `src/policy.js`: secret patterns halt the run, PII
is redacted, sensitive actions stop at a plan. It also adds an evidence ladder
(stop at the first rung that answers the question), a never-read file list, and
disclosure handling for a secret that turns up in the input.

This matters more on the skill path than the runtime path: the Node path fails
closed in code, this one only fails closed if the instruction is followed.
Treat these skills as guidance for a careful agent, not as an enforcement
boundary.
