# Extending claw-orchestrator

## 1) Add a new intent route

1. Add intent in `src/types.js`.
2. Update classifier rules in `src/classifier.js`.
3. Add pipeline mapping in `src/router.js`.
4. Add test coverage in `src/test.js`.

## 2) Add a new role

1. Add role name in `src/types.js`.
2. Add role prompt template in `config/roles/<role>.md`.
3. Include role in route mapping where needed.
4. Verify with `npm test`.

## 3) Add a new adapter

1. Create adapter in `src/adapters/` exposing `executeRole(ctx)`.
2. Wire it in `src/adapters/index.js`.
3. Add mode parsing/usage in CLI help if needed.
4. Add tests for success/failure behavior.

## 4) Add policy checks

- Put checks in `src/policy.js` or `src/channel-policy.js`.
- Ensure blocked runs are explicit and explainable.

## 5) Keep extension safe

- Preserve deterministic run records.
- Never bypass sensitive-action approval gates.
- Keep summary output concise and actionable.
