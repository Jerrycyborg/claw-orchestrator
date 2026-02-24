# API / CLI Reference (Practical)

## Main entrypoint

`node src/cli.js <command> [flags]`

## Commands

### `run`

Create a run; optionally sync and execute.

Example:

```bash
node src/cli.js run \
  --prompt "Implement release checklist" \
  --sync-aahp --execute --mode openclaw --summary
```

Useful flags:

- `--prompt <text>` (required)
- `--handoff-dir <path>` (default `.ai/handoff`)
- `--sync-aahp`
- `--execute`
- `--mode simulate|openclaw`
- `--max-retries <n>`
- `--approve-sensitive`
- `--channel direct|group`
- `--summary`

### `auto`

Shortcut for sync + execute in `openclaw` mode.

### `autopilot`

Reads unchecked `NEXT_ACTIONS.md` tasks and runs them automatically.

### `hook`

Consumes event payload (`--event-file`, stdin, or env) and runs orchestration.

### `status`

Shows recent runs.

### `show --id <run-id>`

Shows one run JSON record.

### `aahp-check`

Displays handoff snapshot readiness and missing files.

## Output model

- JSON output by default
- compact user-readable output with `--summary`
