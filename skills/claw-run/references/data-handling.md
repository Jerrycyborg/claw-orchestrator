# Data handling for claw roles

These skills mirror the gates in `src/policy.js`. The Node path enforces them in
code; on the skill path **you** enforce them. Same rules, both paths.

## Pre-flight (every role, before any other work)

Scan the task text and any file you are about to open for:

| Class                | Patterns (from `src/policy.js`)                                                                     | Action                                                                                                                         |
| -------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Secret**           | `api_key`/`secret`/`token`/`password` assignments, `sk-…`, `ghp_…`, `-----BEGIN … PRIVATE KEY-----` | **high — stop.** Name the field, do not echo the value, recommend rotation, treat as compromised, continue the task without it |
| **PII**              | email addresses, 10–15 digit numbers                                                                | **medium — proceed, redact in output**                                                                                         |
| **Sensitive action** | deploy, production, prod, delete, drop, truncate, rotate key, restart gateway                       | **medium — proceed to a plan, stop before executing.** Ops role decides go/no-go                                               |

`block_on_high_severity: true` in `config/orchestrator.yaml` means a high finding
halts the run. Honour that here: a high finding ends the stage with a stated
blocker, not a workaround.

## Evidence escalation ladder

Stop at the first rung that answers the question. There is no rung 5.

1. **Rung 1 — the name of the thing** — the error string, the failing test name, the file
   and line. Costs nothing, resolves more than expected.
2. **Rung 2 — a state or a count** — "how many tests fail", not the full output.
3. **Rung 3 — a low-sensitivity command** — versions, service states, `git diff --stat`.
4. **Rung 4 — a narrow, bounded slice** — `tail -200`, a time window, one function. Say
   why rungs 1–3 were not enough.

Never `cat` a log. Never read a support bundle, a full config export, or a
whole `.env`. If a task genuinely needs that depth, say so and stop.

## Never read

`.env` and `.env.*` (use `.env.example`), `config/role-command.env`,
`~/.ssh/id_*`, `~/.aws/credentials`, `~/.config/gh/hosts.yml`,
`~/.codex/auth.json`, `~/.claude/.credentials.json`, any `*.pem` / `*.key` /
`*.p12`, `/etc/shadow`, browser cookie stores, CI secret files.

Reading `.env.example` to learn _which_ variables exist is correct and expected.
Reading `.env` to learn their values is not.

## Credentials on command lines

Never. They land in shell history and the process table where any local user
reads them with `ps`. Use an interactive prompt, an environment variable sourced
from a secret store, or a mode-600 credential file.

## If a secret appears in what you were given

Do not repeat it. Name the field and where it was. Recommend rotation and treat
it as already compromised. Then keep helping. No lecture, no refusal.
