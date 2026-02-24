# Contributing to claw-orchestrator

Thanks for contributing 🚀

## Prerequisites

- Node.js 22+
- npm

## Setup

```bash
npm install
```

## Development workflow

1. Create a feature branch.
2. Make changes with focused commits.
3. Run checks locally before pushing:

```bash
npm run lint
npm run format:check
npm test
npm run typecheck
npm run aahp:check
```

## Code style

- ESLint is used for code quality.
- Prettier is used for formatting.
- Pre-commit hooks run lint-staged checks on staged files.

## Commit style

Use conventional commits where possible:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`
- `ci: ...`

## Pull requests

- Keep PRs small and scoped.
- Include a short summary of changes and risks.
- Ensure CI passes before requesting review.
