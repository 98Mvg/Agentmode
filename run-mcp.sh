#!/bin/zsh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
export BROWSER_MCP_DATA_ROOT="$ROOT/data"
export PLAYWRIGHT_BROWSERS_PATH="$ROOT/data/pw-browsers"
exec node "$ROOT/dist/server.js"
