# Troubleshooting

## `Run blocked`

Likely policy or channel gate.

- Check summary reason.
- Use `--approve-sensitive` only when intended.
- In group context, verify channel policy allows execution.

## `aahp:check` shows missing files

Create required files in handoff dir:

- `STATUS.md`
- `NEXT_ACTIONS.md`
- `WORKFLOW.md`
- `TRUST.md`
- `LOG.md`

## OpenClaw execution failing

For `--mode openclaw`:

1. Verify OpenClaw is available (`openclaw ...` works on host).
2. If using API mode, check `OPENCLAW_API_URL`/token/path.
3. If API/CLI unavailable, legacy `OPENCLAW_ROLE_CMD` fallback can be used.

## Autopilot runs nothing

- Ensure `NEXT_ACTIONS.md` has unchecked items (`- [ ] ...`).
- Generic “Run <id>: ...” lines are intentionally skipped.

## Typecheck/test failures

Run:

```bash
npm test
npm run typecheck
```

Fix the first failing module first; many errors are cascading.

## Debug one run deeply

```bash
node src/cli.js show --id <run-id>
```

Inspect:

- `pipeline`
- `stages[*].results`
- `escalation`
