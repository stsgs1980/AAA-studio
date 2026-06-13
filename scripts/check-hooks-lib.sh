#!/bin/bash
# ============================================================
# anti-hallucination-guard / check-hooks-lib.sh
#
# Shared library for hook integrity tools. Provides:
#   - Project/module path resolution
#   - Color setup and logging helpers
#   - detect_module() -- find the AHG module directory
#   - fingerprint()  -- compute SHA256 of a file
#
# Sourced by:
#   - check-hooks-snapshot.sh
#   - check-hooks-verify.sh
# ============================================================

# Guard against double-sourcing
[ -n "${_AHG_LIB_LOADED:-}" ] && return 0
_AHG_LIB_LOADED=1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Initial MODULE_ROOT: where this script lives (one level up from scripts/).
# NOTE: When deployed to a consumer project's scripts/ dir, this resolves
# to the consumer project root, NOT the AHG module. detect_module() below
# will fix this.
_MODULE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
# Resolve PROJECT_ROOT: if AHG is a submodule, git toplevel = consumer root
PROJECT_ROOT="$(git -C "$_MODULE_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$_MODULE_DIR")"
MODULE_ROOT="$_MODULE_DIR"

STATE_FILE="$PROJECT_ROOT/.ahg-integrity.json"

# -- Colors -------------------------------------------------------------------
if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
else
  RED=""; GREEN=""; YELLOW=""; CYAN=""; NC=""
fi

ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
info() { echo -e "${CYAN}[INFO]${NC} $*"; }

# -- Detect module location (validates MODULE_ROOT) ---------------------------
detect_module() {
  # MODULE_ROOT is already set from SCRIPT_DIR/.. above.
  # This function validates it and provides fallback discovery if needed.
  if [ -f "$MODULE_ROOT/setup.sh" ]; then
    return 0
  fi
  # Fallback: search common locations in PROJECT_ROOT
  local candidates=(
    "$PROJECT_ROOT/anti-hallucination-guard"
    "$PROJECT_ROOT/scripts/anti-hallucination-guard"
    "$PROJECT_ROOT/vendor/anti-hallucination-guard"
    "$PROJECT_ROOT/lib/anti-hallucination-guard"
  )
  for dir in "${candidates[@]}"; do
    if [ -d "$dir" ] && [ -f "$dir/setup.sh" ]; then
      MODULE_ROOT="$dir"
      return 0
    fi
  done
  # Try git submodule
  if [ -f "$PROJECT_ROOT/.gitmodules" ]; then
    local sub_path
    sub_path=$(git -C "$PROJECT_ROOT" config -f .gitmodules --get-regexp 'path' 2>/dev/null \
      | grep -i 'anti.hallucination' | awk '{print $2}' | head -1 || true)
    if [ -n "$sub_path" ] && [ -d "$PROJECT_ROOT/$sub_path" ]; then
      MODULE_ROOT="$PROJECT_ROOT/$sub_path"
      return 0
    fi
  fi
  return 1
}

# -- Auto-detect module at source time ---------------------------------------
# This ensures MODULE_ROOT is correct immediately after sourcing this library,
# without requiring each caller to remember to call detect_module().
# The function is still available for explicit re-detection if needed.
if [ ! -f "$MODULE_ROOT/setup.sh" ]; then
    detect_module || true  # Non-fatal: some callers handle the error themselves
fi

# -- Compute SHA256 fingerprint -----------------------------------------------
fingerprint() {
  if command -v sha256sum &>/dev/null; then
    sha256sum "$1" 2>/dev/null | cut -d' ' -f1
  elif command -v shasum &>/dev/null; then
    shasum -a 256 "$1" 2>/dev/null | cut -d' ' -f1
  else
    # Fallback: use md5 (weaker but better than nothing)
    md5sum "$1" 2>/dev/null | cut -d' ' -f1 || echo "unknown"
  fi
}
