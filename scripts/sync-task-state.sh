#!/bin/bash
# ============================================================
# anti-hallucination-guard / sync-task-state.sh
#
# Automatically updates task statuses in cascade-state.json
# based on the existence of implementation files.
#
# Each task should have an "implementationFiles" array listing
# files that prove the task is implemented. If ALL files exist,
# the task status is automatically changed from "pending" to
# "implemented".
#
# Works with any JSON state file that has the structure:
#   { "phases": [{ "tasks": [{ "id", "status", "implementationFiles" }] }] }
#
# Usage:
#   bash scripts/sync-task-state.sh                    # default: cascade-state.json
#   bash scripts/sync-task-state.sh my-state.json      # custom file
#   bash scripts/sync-task-state.sh --dry-run          # preview without writing
#
# Requires: jq
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# Resolve PROJECT_ROOT: if AHG is a submodule, git toplevel = consumer root
PROJECT_ROOT="$(git -C "$MODULE_ROOT" rev-parse --show-toplevel 2>/dev/null || echo "$MODULE_ROOT")"

# -- Parse args ---------------------------------------------------------------
DRY_RUN=false
STATE_FILE="cascade-state.json"

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    *) STATE_FILE="$arg" ;;
  esac
done

STATE_PATH="$PROJECT_ROOT/$STATE_FILE"

# -- Colors -------------------------------------------------------------------
if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; CYAN=""; NC=""
fi
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }
changed() { echo -e "${GREEN}[CHANGED]${NC} $*"; }

# -- Checks -------------------------------------------------------------------

if ! command -v jq &>/dev/null; then
  echo "ERROR: jq is required. Install: apt-get install jq / brew install jq"
  exit 1
fi

if [ ! -f "$STATE_PATH" ]; then
  info "State file not found: $STATE_PATH"
  info "This is OK if the project doesn't use cascade-state.json"
  exit 0
fi

# Validate JSON
if ! jq empty "$STATE_PATH" 2>/dev/null; then
  echo "ERROR: $STATE_FILE is not valid JSON"
  exit 1
fi

info "Scanning $STATE_FILE for tasks with implementationFiles..."

# -- Process tasks ------------------------------------------------------------

UPDATED=0
PENDING_TASKS=0
IMPLEMENTED_TASKS=0
NO_IMPL_FILES=0

# Get all task IDs that have implementationFiles and are pending
TASK_IDS=$(jq -r '.phases[].tasks[] | select(.implementationFiles != null and .implementationFiles | length > 0) | .id' "$STATE_PATH" 2>/dev/null || true)

if [ -z "$TASK_IDS" ]; then
  info "No tasks with implementationFiles found in $STATE_FILE"
  info "Add \"implementationFiles\" arrays to your tasks to enable auto-sync"
  echo ""
  echo "Example task structure:"
  echo '{'
  echo '  "id": "F1.1",'
  echo '  "title": "Feature name",'
  echo '  "status": "pending",'
  echo '  "implementationFiles": ["src/lib/feature.js", "src/parsers/feature.js"]'
  echo '}'
  exit 0
fi

for TASK_ID in $TASK_IDS; do
  # Get current status
  CURRENT_STATUS=$(jq -r ".phases[].tasks[] | select(.id == \"$TASK_ID\") | .status" "$STATE_PATH")

  # Skip already implemented/completed tasks
  if [ "$CURRENT_STATUS" = "implemented" ] || [ "$CURRENT_STATUS" = "completed" ] || [ "$CURRENT_STATUS" = "done" ]; then
    IMPLEMENTED_TASKS=$((IMPLEMENTED_TASKS + 1))
    continue
  fi

  PENDING_TASKS=$((PENDING_TASKS + 1))

  # Get implementation files list
  IMPL_FILES=$(jq -r ".phases[].tasks[] | select(.id == \"$TASK_ID\") | .implementationFiles[]" "$STATE_PATH" 2>/dev/null || true)

  if [ -z "$IMPL_FILES" ]; then
    NO_IMPL_FILES=$((NO_IMPL_FILES + 1))
    continue
  fi

  # Check if ALL implementation files exist
  ALL_EXIST=true
  MISSING=()
  EXISTING=()

  for IMPL_FILE in $IMPL_FILES; do
    FULL_PATH="$PROJECT_ROOT/$IMPL_FILE"
    if [ -f "$FULL_PATH" ]; then
      EXISTING+=("$IMPL_FILE")
    else
      ALL_EXIST=false
      MISSING+=("$IMPL_FILE")
    fi
  done

  if [ "$ALL_EXIST" = true ]; then
    # All files exist -> update status
    if [ "$DRY_RUN" = true ]; then
      changed "[DRY-RUN] $TASK_ID: $CURRENT_STATUS -> implemented (${#EXISTING[@]} files exist)"
    else
      # Update the JSON
      UPDATED_STATE=$(jq "(.phases[].tasks[] | select(.id == \"$TASK_ID\")).status = \"implemented\"" "$STATE_PATH")
      echo "$UPDATED_STATE" > "$STATE_PATH"
      changed "$TASK_ID: $CURRENT_STATUS -> implemented (${#EXISTING[@]} files exist)"
    fi
    UPDATED=$((UPDATED + 1))
  else
    # Some files missing -> report but don't change
    EXISTING_COUNT=${#EXISTING[@]}
    TOTAL_COUNT=$((EXISTING_COUNT + ${#MISSING[@]}))
    warn "$TASK_ID: still $CURRENT_STATUS ($EXISTING_COUNT/$TOTAL_COUNT files exist, missing: ${MISSING[*]})"
  fi
done

# -- Summary ------------------------------------------------------------------

echo ""
echo "=== sync-task-state summary ==="
echo "  Total tasks with implementationFiles: $((PENDING_TASKS + IMPLEMENTED_TASKS + NO_IMPL_FILES))"
echo "  Already implemented: $IMPLEMENTED_TASKS"
echo "  Pending checked: $PENDING_TASKS"
echo "  Auto-updated to implemented: $UPDATED"

if [ "$UPDATED" -gt 0 ] && [ "$DRY_RUN" = false ]; then
  echo ""
  info "State file updated: $STATE_FILE"
  info "Remember to commit the changes!"
fi

if [ "$DRY_RUN" = true ] && [ "$UPDATED" -gt 0 ]; then
  echo ""
  info "Dry run: no changes written. Run without --dry-run to apply."
fi
