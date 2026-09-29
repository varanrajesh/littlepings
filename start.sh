#!/usr/bin/env bash
# ─────────────────────────────────────────────
#  LittlePings — start.sh
#  Starts the Vite dev server on port 5175
# ─────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$ROOT_DIR/.server.pid"
LOG_FILE="$ROOT_DIR/.server.log"
PORT=5175

# ── Guard: already running via PID file? ─────
if [[ -f "$PID_FILE" ]]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    echo "⚠️  LittlePings is already running (PID $OLD_PID) on http://localhost:$PORT"
    echo "   Run ./stop.sh first if you want to restart."
    exit 1
  else
    echo "🧹  Removing stale PID file (PID $OLD_PID no longer exists)."
    rm -f "$PID_FILE"
  fi
fi

# ── Kill any zombie process squatting on port ─
SQUATTER=$(lsof -ti tcp:"$PORT" 2>/dev/null || true)
if [[ -n "$SQUATTER" ]]; then
  echo "⚠️  Port $PORT is occupied by PID(s): $SQUATTER — clearing..."
  echo "$SQUATTER" | xargs kill -9 2>/dev/null || true
  sleep 1
  echo "✅  Port $PORT is now free."
fi

# ── Check npm ────────────────────────────────
if ! command -v npm &>/dev/null; then
  echo "❌  npm not found. Please install Node.js first."
  exit 1
fi

# ── Start server ─────────────────────────────
echo "🚀  Starting LittlePings on http://localhost:$PORT ..."
cd "$ROOT_DIR"

nohup npm run dev > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

# ── Wait for server (max 20s) ─────────────────
echo -n "⏳  Waiting for server"
for i in $(seq 1 40); do
  # Check if the process died early
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo ""
    echo "❌  Server process died unexpectedly. Check logs:"
    echo "   cat $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
  fi

  # Check if server is responding on the port
  if curl -s --max-time 1 "http://localhost:$PORT" -o /dev/null 2>/dev/null; then
    echo ""
    echo "✅  LittlePings is live → http://localhost:$PORT  (PID $SERVER_PID)"
    echo "   Logs  → cat $LOG_FILE"
    echo "   Stop  → ./stop.sh"
    exit 0
  fi

  echo -n "."
  sleep 0.5
done

echo ""
# Last resort: check if server came up but curl missed it
if lsof -ti tcp:"$PORT" &>/dev/null; then
  echo "✅  LittlePings is live → http://localhost:$PORT  (PID $SERVER_PID)"
  echo "   Logs  → cat $LOG_FILE"
  echo "   Stop  → ./stop.sh"
  exit 0
fi

echo "⚠️  Server started (PID $SERVER_PID) but did not respond in 20s."
echo "   Check logs: cat $LOG_FILE"
