#!/usr/bin/env bash
# Install the claw role skills for Claude Code and/or OpenAI Codex CLI.
#
#   ./install.sh              # auto-detect installed hosts
#   ./install.sh --host claude
#   ./install.sh --host codex
#   ./install.sh --uninstall
#
# Copies, does not symlink — so an agent reading the skill never follows a link
# out of its skill directory. Re-run after pulling changes.
set -euo pipefail

SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS=(claw-run claw-researcher claw-architect claw-implementer claw-reviewer claw-ops)
HOST=""; UNINSTALL=0

while [ $# -gt 0 ]; do
  case "$1" in
    --host) HOST="${2:-}"; shift 2 ;;
    --uninstall) UNINSTALL=1; shift ;;
    -h|--help) sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

claude_dir() { echo "${CLAUDE_HOME:-$HOME/.claude}/skills"; }
codex_dir()  { echo "${CODEX_HOME:-$HOME/.codex}/skills"; }

targets=()
case "$HOST" in
  claude) targets+=("$(claude_dir)") ;;
  codex)  targets+=("$(codex_dir)")  ;;
  "")
    [ -d "${CLAUDE_HOME:-$HOME/.claude}" ] && targets+=("$(claude_dir)")
    [ -d "${CODEX_HOME:-$HOME/.codex}"   ] && targets+=("$(codex_dir)")
    if [ ${#targets[@]} -eq 0 ]; then
      echo "No Claude Code (~/.claude) or Codex (~/.codex) install found." >&2
      echo "Pass --host claude or --host codex to install anyway." >&2
      exit 1
    fi ;;
  *) echo "unknown host: $HOST (expected: claude, codex)" >&2; exit 2 ;;
esac

for dir in "${targets[@]}"; do
  for s in "${SKILLS[@]}"; do
    if [ "$UNINSTALL" -eq 1 ]; then
      rm -rf "${dir:?}/$s"; echo "removed  $dir/$s"
    else
      [ -d "$SRC/$s" ] || { echo "missing source: $SRC/$s" >&2; exit 1; }
      mkdir -p "$dir"
      rm -rf "${dir:?}/$s"
      cp -R "$SRC/$s" "$dir/$s"
      echo "installed $dir/$s"
    fi
  done
done

if [ "$UNINSTALL" -eq 0 ]; then
  echo
  echo "Done. Start a new session, then:  /claw-run <your task>"
  echo "Individual roles: /claw-researcher /claw-architect /claw-implementer /claw-reviewer /claw-ops"
fi
