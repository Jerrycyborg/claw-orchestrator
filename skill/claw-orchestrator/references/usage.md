# Usage

## Command
`./scripts/orchestrate.sh "<prompt>"`

## Behavior
- Executes `node src/cli.js auto --prompt "..." --summary`.
- Prints clean summary, not raw JSON.
- Uses OpenClaw real role dispatch.

## Policy
- If sensitive action is detected, require explicit approval.
