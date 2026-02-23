# Architecture (Draft)

## Components
1. Intent Classifier
2. Routing Engine
3. Role Executors
4. Handoff Manager (AAHP)
5. Policy Engine
6. Run Logger

## Default Pipeline
- Researcher -> Architect -> Implementer -> Reviewer
- Ops joins when prompt is deployment/security/config heavy.

## Execution Modes
- `simulate` (default): local adapter for deterministic dry-runs
- `openclaw`: bridge adapter that can execute role calls through OpenClaw CLI hooks
- Persistent role session mode (future when runtime thread hooks are available)

## OpenClaw Adapter Bridge
`openclaw` mode supports two levels:
1. Probe mode (default): verifies OpenClaw reachability via `openclaw status`
2. Command bridge mode: set `OPENCLAW_ROLE_CMD` template for real role execution.

Template placeholders:
- `{role}`
- `{prompt}`
- `{intent}`
- `{runId}`

Example:
```bash
export OPENCLAW_ROLE_CMD='openclaw sessions send --label pool-{role} --message "{prompt}"'
node src/cli.js run --prompt "Implement feature X" --execute --mode openclaw
```
