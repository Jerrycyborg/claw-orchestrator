# Handoff for Dork

_Last updated: 2026-02-23_

## ✅ Current State
Project: `claw-orchestrator`
Repo: `https://github.com/Jerrycyborg/claw-orchestrator`
Latest commit at handoff: `b6d9afa`

Working now:
- End-to-end orchestration command:
  - `./scripts/orchestrate.sh "<prompt>"`
- One-step setup:
  - `bash ./scripts/setup.sh`
- Real role dispatch through OpenClaw agents in `auto` mode
- Clean summary output (`--summary`)
- Local skill package included (`skill/claw-orchestrator`)

---

## 📁 Important Files

### Core
- `src/cli.js` → commands (`auto`, `run`, `status`, `show`, `aahp-check`)
- `src/orchestrator.js` → run creation + AAHP sync
- `src/executor.js` → state machine execution
- `src/policy.js` → secret/PII/sensitive action gating

### Adapters
- `src/adapters/simulate-adapter.js`
- `src/adapters/openclaw-adapter.js`
- `src/adapters/index.js`

### Productization
- `scripts/setup.sh`
- `scripts/install.sh`
- `scripts/orchestrate.sh`

### Skill integration
- `skill/claw-orchestrator/SKILL.md`
- `skill/claw-orchestrator/references/usage.md`

### Docs
- `README.md`
- `CRITIQUE.md`
- `docs/RESEARCH_SUMMARY.md`
- `docs/TECH_DECISIONS.md`
- `docs/ROADMAP.md`

---

## 🧪 Verified Commands

```bash
npm test
./scripts/setup.sh
./scripts/orchestrate.sh "Create a release checklist"
node src/cli.js status
```

Expected orchestration summary output:
- Run completed
- intent classification
- stage-by-stage role statuses

---

## ⚠️ Known Limitations

1. Not a native OpenClaw plugin hook yet (skill + command integration path currently).
2. Codebase is JS; TS migration planned.
3. Channel policy integration still pending.
4. Native OpenClaw API adapter (without shell bridge) still pending.

---

## 🎯 Next Priority Tasks for Dork

1. **Native plugin/hook integration**
   - Auto-trigger directly from session events without explicit script invocation.

2. **TypeScript migration (incremental)**
   - Start with: `types`, `router`, `executor`, `adapters`.

3. **Channel policy integration**
   - Enforce DM/group policy checks before execution.

4. **Owner UX improvements**
   - Add `--summary json|text|md` formats.
   - Add concise run outcome digest.

5. **Resilience hardening**
   - Retry policy and timeout strategy per role.
   - Better failure reason surface in summaries.

---

## ✅ Definition of Done for next milestone
- Prompt in session can auto-trigger orchestrator without manual scripts.
- End-to-end run completes with clear summary and safety gates.
- Basic TS migration landed for core modules.
- CI checks pass (tests + security scan).
