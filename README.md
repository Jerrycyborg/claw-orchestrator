# claw-orchestrator

🧠 Multi-agent orchestration layer for OpenClaw.

## 🚀 What this project is
`claw-orchestrator` is a standalone project that coordinates specialized agent roles from a single prompt and executes a predictable pipeline.

Default role set:
- 🔭 Researcher
- 🏛️ Architect
- ⚙️ Implementer
- 💬 Reviewer
- 🛡️ Ops

It is designed to work with **AAHP-style handoffs** and supports both:
- Stateless execution (current safe default)
- Persistent role-session execution (when runtime supports it)

---

## ✅ Current status
- Project scaffold created
- Initial routing config added
- Architecture + roadmap docs added
- Phase 1 core implemented:
  - prompt intent classifier
  - pipeline router (sequential + parallel)
  - run store + run trace output
  - CLI (`run`, `status`, `show`)
- Phase 2 AAHP integration implemented
- Phase 3 policy gates implemented
- Phase 5/6 execution adapters implemented (`simulate` + `openclaw` bridge)
- Git repository initialized

> This is now a **working prototype** (not production-ready yet).

---

## 🧩 Use cases
- Route prompts to the right role sequence automatically
- Enforce review gates before task completion
- Maintain traceable run logs (who did what, when, with what confidence)
- Add policy controls for sensitive actions

---

## 🛠️ Planned MVP features
- Prompt intent classifier ✅
- Role pipeline router (sequential + parallel branches) ✅
- Retry/escalation policy ⏳
- Run state and trace storage ✅
- AAHP handoff read/write manager ✅
- Execution adapters:
  - `simulate` adapter ✅
  - `openclaw` adapter bridge ✅
- CLI commands:
  - `orchestrator run` ✅
  - `orchestrator status` ✅
  - `orchestrator show` ✅

---

## 🔒 Security posture (current)
Implemented now:
- `.gitignore` for common local/secrets artifacts
- No credentials in source files

Implemented now:
- Secret scanning in CI (gitleaks workflow)
- `SECURITY.md` + reporting process
- Prompt-time policy gate for secret/PII patterns
- Sensitive-action approval flag (`--approve-sensitive`)

Still required (next):
- Optional pre-commit checks
- More robust secret detectors and allowlist tuning

---

## 📁 Project structure
- `docs/` architecture, roadmap, design notes
- `src/` orchestrator core and execution adapters
- `config/` routing, role templates, and bridge command examples
- `scripts/` local helper scripts
- `.github/workflows/` CI/security checks

---

## ▶️ Getting started (prototype)
```bash
# 1) clone repo
# 2) run unit tests
npm test

# 3) execute in simulate mode
node src/cli.js run --prompt "Implement Firestore rules and review security" --execute --mode simulate

# 4) check runs
node src/cli.js status

# 5) openclaw bridge mode (probe if no command template is set)
node src/cli.js run --prompt "Implement Firestore rules and review security" --execute --mode openclaw

# 6) enable real role dispatch bridge
export OPENCLAW_ROLE_CMD='openclaw sessions send --label pool-{role} --message "{rolePrompt}"'
node src/cli.js run --prompt "Implement Firestore rules and review security" --execute --mode openclaw
```

---

## 🗺️ Next step
Implement channel policy integration and execution adapters so planned pipelines can trigger real role workers.
