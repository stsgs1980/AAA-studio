#!/bin/bash
# AAA-studio dev script — build with webpack (turbopack can't handle 26K+ LOC),
# then run production server.
set -e
cd /home/z/my-project

echo "[DEV] Installing dependencies..."
bun install --frozen-lockfile 2>/dev/null || bun install

echo "[DEV] Generating Prisma client..."
bun run db:generate 2>/dev/null || true
bun run db:push 2>/dev/null || true

echo "[DEV] Building project (webpack)..."
npx next build

echo "[DEV] Starting production server on :3000..."
exec npx next start -p 3000 -H 0.0.0.0
