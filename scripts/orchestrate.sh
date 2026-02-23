#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./scripts/orchestrate.sh \"<prompt>\""
  exit 1
fi

PROMPT="$*"
cd "$(dirname "$0")/.."
node src/cli.js auto --prompt "$PROMPT" --summary
