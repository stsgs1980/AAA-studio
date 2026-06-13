#!/usr/bin/env bash
# ============================================================
# anti-hallucination-guard / co-change-check.sh
# Detects that buddy files change together in a commit.
#
# If file A changes, file B should also change.
# If B is missing from the commit -> WARN (or BLOCK).
#
# Called from pre-commit hook (Phase 5).
# Can also be run manually: bash scripts/co-change-check.sh
#
# Configuration: .ahg-cochange.json in project root
# Bypass: [no-cochange] in commit message or COCHANGE_BYPASS=1 env
# ============================================================

set -euo pipefail

# -- Colors --
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERR]${NC} $*"; }

# -- Resolve project root --
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

# -- Find config --
CONFIG=""
# 1. Project root
if [ -f "$PROJECT_ROOT/.ahg-cochange.json" ]; then
    CONFIG="$PROJECT_ROOT/.ahg-cochange.json"
# 2. AHG module (if running as submodule)
elif [ -n "${_pc_ahg_dir:-}" ] && [ -f "${_pc_ahg_dir}/.ahg-cochange.json" ]; then
    CONFIG="${_pc_ahg_dir}/.ahg-cochange.json"
# 3. Same directory as this script (AHG standalone repo)
else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/../.ahg-cochange.json" ]; then
        CONFIG="$SCRIPT_DIR/../.ahg-cochange.json"
    fi
fi

if [ -z "$CONFIG" ]; then
    # No config -> skip silently
    exit 0
fi

# -- Get staged files --
STAGED=$(git diff --cached --name-only 2>/dev/null || echo "")
if [ -z "$STAGED" ]; then
    # Nothing staged, nothing to check
    exit 0
fi

# -- Check for [no-cochange] bypass --
# Supports multiple sources: env var, COMMIT_EDITMSG, or git commit -m message.
BYPASS=0

# 1. Explicit env var bypass
if [ "${COCHANGE_BYPASS:-0}" = "1" ]; then
    BYPASS=1
fi

# 2. Check COMMIT_EDITMSG (works for editor-based commits)
if [ "$BYPASS" -eq 0 ] && [ -f "$PROJECT_ROOT/.git/COMMIT_EDITMSG" ]; then
    if grep -qi "\[no-cochange\]" "$PROJECT_ROOT/.git/COMMIT_EDITMSG" 2>/dev/null; then
        BYPASS=1
    fi
fi

# 3. Check COCHANGE_COMMIT_MSG env var (for git commit -m style)
#    Pre-commit hook can set this before calling this script.
if [ "$BYPASS" -eq 0 ] && [ -n "${COCHANGE_COMMIT_MSG:-}" ]; then
    if echo "$COCHANGE_COMMIT_MSG" | grep -qi "\[no-cochange\]"; then
        BYPASS=1
    fi
fi

if [ "$BYPASS" -eq 1 ]; then
    ok "[co-change] Bypass: [no-cochange] detected"
    exit 0
fi

# -- Use python3 to parse JSON config and check --
if ! command -v python3 &>/dev/null; then
    # No python3 -> skip
    exit 0
fi

# Write staged files to a temp file to avoid env var size limits
# and newline-in-filename issues.
_tmpfile=$(mktemp)
echo "$STAGED" > "$_tmpfile"

# Export variables for python3
export COCHANGE_CONFIG="$CONFIG"
export COCHANGE_STAGED_FILE="$_tmpfile"

python3 -c '
import json, sys, os, fnmatch

config_path = os.environ.get("COCHANGE_CONFIG", "")
staged_file = os.environ.get("COCHANGE_STAGED_FILE", "")

if not config_path:
    sys.exit(0)

# Read staged files from temp file (handles newlines in filenames)
staged = set()
if staged_file and os.path.isfile(staged_file):
    with open(staged_file) as f:
        for line in f:
            staged.add(line.rstrip("\n"))
elif not staged_file:
    sys.exit(0)

with open(config_path) as f:
    config = json.load(f)

pairs = config.get("pairs", [])
violations = 0
warnings = 0

for pair in pairs:
    trigger = pair.get("trigger", "")
    buddies = pair.get("expect", [])
    severity = pair.get("severity", "warn")
    message = pair.get("message", "")

    # Check if any staged file matches the trigger pattern
    # Note: fnmatch * matches across directory separators,
    # so "scripts/*" will match "scripts/sub/deep/file.sh"
    triggered = False
    for s in staged:
        if "*" in trigger:
            if fnmatch.fnmatch(s, trigger):
                triggered = True
                break
        else:
            if s == trigger:
                triggered = True
                break

    if not triggered:
        continue

    # Trigger file is in commit. Check if buddies are also present.
    missing = []
    for buddy in buddies:
        found = False
        if "*" in buddy:
            for s in staged:
                if fnmatch.fnmatch(s, buddy):
                    found = True
                    break
        else:
            found = buddy in staged

        if not found:
            missing.append(buddy)

    if missing:
        if severity == "block":
            violations += 1
        else:
            warnings += 1

        print("  [%s] Trigger: %s" % (severity.upper(), trigger))
        print("    Missing buddy files: %s" % ", ".join(missing))
        if message:
            print("    %s" % message)

# Output result:
# - violations (block) -> exit 2 (signals hard block)
# - warnings only     -> exit 0 (non-blocking)
# - all good          -> exit 0
if violations > 0:
    print("\n  CO-CHANGE BLOCKED: %d required buddy file(s) not in commit." % violations)
    sys.exit(2)
elif warnings > 0:
    print("\n  CO-CHANGE WARNING: %d buddy file(s) not in commit." % warnings)
    print("  Consider updating the listed files before committing.")
    sys.exit(0)
else:
    print("  [OK] All co-change buddies present")
    sys.exit(0)
'

result=$?

# Clean up temp file
rm -f "$_tmpfile" 2>/dev/null || true

# Exit code semantics:
#   0 = pass (all buddies present, or only warnings)
#   2 = blocked (severity=block violations found)
#   1 = python error (unexpected)
if [ "$result" -eq 2 ]; then
    echo ""
    err "Co-change violations found. Commit blocked."
    err "Add missing buddy files or use [no-cochange] in commit message."
    exit 1
elif [ "$result" -eq 1 ]; then
    # Unexpected python error -- warn but don't block
    warn "co-change-check: unexpected error (exit code 1)"
    exit 0
fi

# result=0 -> all good or only warnings
exit 0
