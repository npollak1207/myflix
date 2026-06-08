#!/usr/bin/env bash
#
# MyFlix dev launcher (macOS / Linux).
#
# Usage:
#   ./dev.sh         Start the frontend dev server (Vite on :5173)
#   ./dev.sh --stop  Stop the frontend dev server
#
# Unlike dev.ps1 (which boots a bundled Windows Jellyfin), this assumes you point
# VITE_JELLYFIN_TARGET at an existing Jellyfin server in frontend/.env.local
# (e.g. a remote box or a `docker compose up jellyfin`). The Vite proxy handles
# the rest, so the browser still talks to a single same-origin host.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND="$ROOT/frontend"

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -ti tcp:"$port" 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill -9 2>/dev/null || true
  fi
}

if [ "${1:-}" = "--stop" ] || [ "${1:-}" = "-Stop" ]; then
  echo "Stopping frontend (:5173)..."
  stop_port 5173
  echo "Stopped."
  exit 0
fi

if [ ! -f "$FRONTEND/.env.local" ]; then
  echo "warning: $FRONTEND/.env.local not found."
  echo "  cp frontend/.env.example frontend/.env.local and set VITE_JELLYFIN_TARGET"
  echo "  to your Jellyfin server URL, then re-run ./dev.sh."
fi

if [ ! -d "$FRONTEND/node_modules" ]; then
  echo "[1/2] Installing dependencies..."
  (cd "$FRONTEND" && npm install)
else
  echo "[1/2] Dependencies present."
fi

echo "[2/2] Starting frontend dev server on :5173..."
echo
echo "  App: http://localhost:5173"
echo "  Ctrl+C stops the dev server."
echo
cd "$FRONTEND"
exec npm run dev
