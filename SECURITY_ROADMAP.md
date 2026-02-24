# SECURITY_ROADMAP

## Phase 1 (done)

- Prompt secret/PII pattern detection
- Sensitive-action approval gate
- Channel policy guardrails
- Pre-commit lint/format checks

## Phase 2 (current)

- Add pre-commit secret scan (`npm run secret:scan`)
- Add `.env.example` for safe config onboarding
- Add AAHP handoff file validation checks
- Add JSONL audit trail for policy/channel decisions (`.ai/handoff/AUDIT.log.jsonl`)

## Phase 3 (next)

- Integrate gitleaks/trufflehog in CI as blocking checks
- Add signed policy decision records (tamper-evident)
- Expand PII detection with configurable jurisdiction profiles
- Add retention policy and secure export for audit logs

## Validation process

1. Run `npm run secret:scan`
2. Run `npm test`
3. Run `npm run typecheck`
4. Run `node src/cli.js aahp-check` and confirm `ready: true`
5. Verify `.ai/handoff/AUDIT.log.jsonl` captures blocked/approval-required decisions
