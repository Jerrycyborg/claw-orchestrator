---
name: claw-run
description: Run the full claw multi-role pipeline on one task — classifies intent, routes to the right sequence of researcher, architect, implementer, reviewer and ops roles, enforces the policy gates, and returns a single summary with stage outcomes and a go/no-go. Use to execute a task end-to-end, coordinate multiple roles, or get one-command orchestration. Applies claw data-handling rules (no secrets, bounded evidence).
---

# claw-run

Coordinates the five claw roles from a single prompt. Mirrors
`src/classifier.js`, `src/router.js` and `src/policy.js` — but as instructions,
so it works with no Node runtime, no repo checkout, and no orchestrator process.

**Read `references/data-handling.md` and run its pre-flight before anything else.**

## Data handling

**Pre-flight, before anything else.** Scan the task and any file you open. A
secret pattern (`api_key`/`token`/`password` assignment, `sk-…`, `ghp_…`,
`BEGIN … PRIVATE KEY`) is **high — halt the stage**: name the field, never echo
the value, recommend rotation, treat it as compromised, continue without it.
Email addresses and 10–15 digit numbers are PII — redact in output. Deploy,
prod, delete, drop, truncate, rotate-key, restart-gateway are sensitive actions
— plan them, stop before executing.

**Evidence escalation ladder — stop at the first rung that answers the question:**

1. **Rung 1 — the name of the thing** — error string, failing test name, `file:line`. Free.
2. **Rung 2 — a state or a count** — "how many fail", not the full output.
3. **Rung 3 — a low-sensitivity command** — versions, service states, `git diff --stat`.
4. **Rung 4 — a narrow, bounded slice** — `tail -200`, one function, a time window. Say why 1–3 were not enough.
5. **Rung 5 — does not exist.**

Never `cat` a log, a support bundle, a full config export, or any `.env`.
`.env.example` for variable _names_ is fine; `.env` for their values is not.
Never read `~/.ssh/id_*`, `~/.aws/credentials`, `*.pem`/`*.key`/`*.p12`,
`~/.codex/auth.json`, `~/.claude/.credentials.json`, `/etc/shadow`.
Never put a credential on a command line — shell history and `ps`.

Full detail: `references/data-handling.md`.

## Step 1 — Policy pre-flight

Scan the task text per `references/data-handling.md`.
**A high finding halts the run** (`block_on_high_severity: true`). Report the
blocker; do not route around it.

## Step 2 — Classify intent

Score the task against these word sets (from `src/classifier.js`):

- **research** — research, compare, options, evaluate, benchmark, pros, cons, market, feasibility, why
- **build** — implement, build, create, fix, refactor, code, feature, bug, add, develop
- **security** — security, secure, hardening, firewall, ssh, compliance, audit, risk, policy, config

Apply in order:

| Condition                                                            | Intent                                 |
| -------------------------------------------------------------------- | -------------------------------------- |
| `security ≥ 2`, or `security ≥ 1` with no build and no research hits | `security_ops`                         |
| `research ≥ 2` and `build ≤ 1`                                       | `research_heavy`                       |
| `build ≥ 1`                                                          | `build_change`                         |
| otherwise                                                            | `ambiguous_parallel` (confidence 0.55) |

**State the intent and your confidence before proceeding.** Below the
`require_confidence_threshold: 0.55` in `config/orchestrator.yaml`, ask the user
which route they want instead of guessing.

## Step 3 — Route

From `config/orchestrator.yaml`:

| Intent               | Sequence                                                      |
| -------------------- | ------------------------------------------------------------- |
| `research_heavy`     | **claw-researcher** → **claw-architect**                      |
| `build_change`       | **claw-architect** → **claw-implementer** → **claw-reviewer** |
| `security_ops`       | **claw-ops** → **claw-reviewer**                              |
| `ambiguous_parallel` | **claw-researcher** ∥ **claw-ops**, then **claw-architect**   |

For `ambiguous_parallel`, run the two independent roles before either informs
the other — that parallelism is the point; do not collapse it into a sequence.

## Step 4 — Run each stage

Invoke each role skill in order. For every stage:

1. Pass forward only that role's **handoff** items, not its full output. The
   handoff contract is at the end of each role skill.
2. Record the stage outcome: `ok` · `blocked` · `needs-human`.
3. **Stop the run on `blocked`.** A NO-GO from claw-reviewer or claw-ops ends it.
   Do not proceed to the next stage hoping it resolves.

## Step 5 — Report

```
RUN            intent · confidence · route taken
STAGES         role · outcome · one-line result
FINDINGS       anything high or medium, carried up from any stage
BLOCKED BY     the stage and the specific reason, if stopped
GO / NO-GO     from the terminal role
NEXT ACTION    one concrete thing
```

## Rules

- **Do not skip stages** because the task looks simple. The route is the route.
  If a stage is genuinely inapplicable, say so and record it as skipped with a
  reason — never silently.
- **Do not merge roles.** The separation is what makes the reviewer's finding
  independent of the implementer's intent. An implementer who reviews their own
  work is not a reviewer.
- Carry findings **up**, not sideways. A medium finding at implement time must
  still appear in the final report.
- Executing against production is never part of a run. claw-ops produces the
  plan; a human executes it.

## When the Node orchestrator is available instead

If the `claw-orchestrator` repo is checked out and installed, the runtime path
adds an audit ledger, run IDs, persisted traces, and policy enforcement in code
rather than in instructions:

```bash
scripts/orchestrate.sh "<task>"        # manual
scripts/hook-dispatch.sh               # session events, channel context enforced
```

Prefer that path when you need the audit trail. Prefer this skill path when you
need the roles anywhere else — another machine, another agent, no Node.
Both honour the same gates; only one of them can prove it afterwards.
