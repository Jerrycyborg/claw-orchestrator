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
- Auto-trigger from OpenClaw session when installed as local skill (`skill/claw-orchestrator`)

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
- Local pre-commit secret scan (`npm run secret:scan`)
- `SECURITY.md` + `SECURITY_ROADMAP.md`
- Prompt-time policy gate for secret/PII patterns
- Sensitive-action approval flag (`--approve-sensitive`)
- AAHP handoff file validation + audit trail (`.ai/handoff/AUDIT.log.jsonl`)

Still required (next):

- Signed/tamper-evident policy audit records
- More robust secret detectors and allowlist tuning

---

## 📁 Project structure

- `docs/` architecture, roadmap, design notes
- `src/` orchestrator core and execution adapters
- `config/` routing, role templates, and bridge command examples
- `scripts/` local helper scripts
- `.github/workflows/` CI/security checks (security scan + release gate)

## 📚 Documentation

- Architecture: `docs/ARCHITECTURE.md`
- CLI/API reference: `docs/API.md`
- Extending the system: `docs/EXTENDING.md`
- Troubleshooting: `docs/TROUBLESHOOTING.md`
- Roadmap: `docs/ROADMAP.md`

---

## ▶️ Getting started (out-of-box)

```bash
# 1) clone repo
# 2) install deps + hooks
npm install
# 3) one-step setup (installs local skill + scripts)
bash ./scripts/setup.sh

# 3) run end-to-end orchestration with clean summary
./scripts/orchestrate.sh "Implement Firestore rules and review security"

# 4) inspect runs
node src/cli.js status

# 5) continue automatically from .ai/handoff/NEXT_ACTIONS.md
node src/cli.js autopilot --summary --max-runs 3

# 6) optional: event-driven hook mode (stdin or --event-file)
echo '{"message":{"text":"Create release checklist"},"channelType":"dm"}' | node src/cli.js hook

# 7) quality checks
npm run lint
npm run format:check
npm run typecheck
```

See `CONTRIBUTING.md` for full development guidelines.

---

## 🗺️ Next step

Extend native plugin lifecycle wiring and observability for the OpenClaw API path, then expand TS migration from typed JS checks into fully migrated `.ts` modules.
