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
- Git repository initialized

> This is an **MVP bootstrap**, not yet production-ready.

---

## 🧩 Use cases
- Route prompts to the right role sequence automatically
- Enforce review gates before task completion
- Maintain traceable run logs (who did what, when, with what confidence)
- Add policy controls for sensitive actions

---

## 🛠️ Planned MVP features
- Prompt intent classifier
- Role pipeline router (sequential + parallel branches)
- Retry/escalation policy
- Run state and trace storage
- AAHP handoff read/write manager
- CLI commands:
  - `orchestrator run`
  - `orchestrator status`

---

## 🔒 Security posture (current)
Implemented now:
- `.gitignore` for common local/secrets artifacts
- No credentials in source files

Still required (next):
- Secret scanning in CI (e.g., gitleaks)
- Basic `SECURITY.md` + reporting process
- Optional pre-commit checks

---

## 📁 Project structure
- `docs/` architecture, roadmap, design notes
- `src/` orchestrator core (to be implemented)
- `config/` routing and policy configuration
- `scripts/` local helper scripts
- `.github/workflows/` CI/security checks

---

## ▶️ Getting started (bootstrap)
```bash
# 1) clone repo
# 2) inspect roadmap
cat docs/ROADMAP.md

# 3) inspect architecture
cat docs/ARCHITECTURE.md

# 4) copy config template
cp config/orchestrator.example.yaml config/orchestrator.yaml
```

---

## 🗺️ Next step
Implement Phase 1 core orchestrator engine from `docs/ROADMAP.md`.
