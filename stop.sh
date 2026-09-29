#!/usr/bin/env bash
# ─────────────────────────────────────────────
#  LittlePings — stop.sh
#  Stops the Vite dev server started by start.sh
# ─────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/.server.pid"
PORT=5175

stop_port_squatter() {
  local PIDS
  PIDS=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
  if [[ -n "$PIDS" ]]; then
    echo "🧹  Killing leftover process(es) on port $PORT: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 0.5
  fi
}

# ── No PID file ──────────────────────────────
if [[ ! -f "$PID_FILE" ]]; then
  echo "ℹ️  No .server.pid file found."
  stop_port_squatter
  echo "✅  Port $PORT is clear."
  exit 0
fi

PID=$(cat "$PID_FILE")

# ── Process already gone ─────────────────────
if ! kill -0 "$PID" 2>/dev/null; then
  echo "ℹ️  PID $PID is no longer running. Cleaning up."
  rm -f "$PID_FILE"
  stop_port_squatter
  echo "✅  Done."
  exit 0
fi

# ── Graceful stop ────────────────────────────
echo "🛑  Stopping LittlePings (PID $PID)..."
kill -TERM "$PID" 2>/dev/null || true

# Wait up to 5s
for i in $(seq 1 10); do
  sleep 0.5
  if ! kill -0 "$PID" 2>/dev/null; then
    break
  fi
done

# Force kill if still alive
if kill -0 "$PID" 2>/dev/null; then
  echo "⚠️  Graceful shutdown timed out — force killing PID $PID..."
  kill -KILL "$PID" 2>/dev/null || true
fi

rm -f "$PID_FILE"

# Clean up any child Vite processes still on port
stop_port_squatter

echo "✅  LittlePings stopped."
