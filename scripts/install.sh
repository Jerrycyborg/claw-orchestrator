#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKILL_SRC="$ROOT/skill/claw-orchestrator"
SKILL_DEST="$HOME/.openclaw/workspace/skills/claw-orchestrator"

mkdir -p "$HOME/.openclaw/workspace/skills"
rm -rf "$SKILL_DEST"
cp -R "$SKILL_SRC" "$SKILL_DEST"

chmod +x "$ROOT/scripts/orchestrate.sh"

cat <<EOF
✅ Installed claw-orchestrator skill to:
$SKILL_DEST

Next:
1) Restart OpenClaw gateway (or /new session) to refresh skills.
2) Use command:
   $ROOT/scripts/orchestrate.sh "your task prompt"
EOF
