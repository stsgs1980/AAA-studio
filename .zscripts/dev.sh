#!/bin/bash
# AAA-studio dev script — build with webpack (turbopack can't handle 26K+ LOC),
# then run production server with auto-restart on crash.
cd /home/z/my-project

LOG="/home/z/my-project/.zscripts/dev.log"
echo "$(date) [DEV] Starting..." > "$LOG"

echo "$(date) [DEV] Installing dependencies..." >> "$LOG"
bun install --frozen-lockfile 2>/dev/null || bun install >> "$LOG" 2>&1

echo "$(date) [DEV] Generating Prisma client..." >> "$LOG"
bun run db:generate 2>/dev/null || true
bun run db:push 2>/dev/null || true

echo "$(date) [DEV] Building project (webpack)..." >> "$LOG"
npx next build >> "$LOG" 2>&1

echo "$(date) [DEV] Starting production server on :3000 with auto-restart..." >> "$LOG"
echo "$$" > /home/z/my-project/.zscripts/dev.pid

# Auto-restart loop: if next start dies, restart after 3s
# CRITICAL: no set -e here — the while loop must survive non-zero exits
while true; do
  npx next start -p 3000 -H 0.0.0.0 >> "$LOG" 2>&1
  EXIT_CODE=$?
  echo "$(date) [DEV] Server exited with code $EXIT_CODE, restarting in 3s..." >> "$LOG"
  sleep 3
done
