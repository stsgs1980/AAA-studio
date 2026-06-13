#!/usr/bin/env bash
# ============================================================
# anti-hallucination-guard / line-count-check.sh
# Enforces Rule 12 (anti-monolith): no file over LINE_LIMIT lines.
#
# Called from pre-commit hook (Phase 4).
# Can also be run manually: bash scripts/line-count-check.sh
#
# Configuration (priority: env vars > .ahgrc > defaults):
#   LINE_LIMIT      -- max lines per file (default: 250)
#   LINE_CHECK_DIR  -- directory to scan (default: . = project root)
#   LINE_CHECK_GLOB -- file patterns to check (default: common source files)
#   LINE_CHECK_SKIP -- file patterns to skip (default: node_modules, .git, etc.)
#   .ahgrc          -- JSON config file in project root (auto-loaded)
# ============================================================

set -euo pipefail

# -- Load .ahgrc if available (priority: env vars > .ahgrc > defaults) --
_AHGRC_FILE=""
_PROJECT_ROOT_PREVIEW="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
for _ahgrc_try in "$_PROJECT_ROOT_PREVIEW/.ahgrc" "$(pwd)/.ahgrc"; do
    if [ -f "$_ahgrc_try" ]; then
        _AHGRC_FILE="$_ahgrc_try"
        break
    fi
done

if [ -n "$_AHGRC_FILE" ] && command -v python3 &>/dev/null; then
    # Read values from .ahgrc JSON (env vars override .ahgrc)
    _ahgrc_limit=$(python3 -c "import json; print(json.load(open('$_AHGRC_FILE')).get('line_check_limit', 250))" 2>/dev/null || echo "")
    _ahgrc_cap=$(python3 -c "import json; print(json.load(open('$_AHGRC_FILE')).get('line_check_hard_cap', 400))" 2>/dev/null || echo "")
    _ahgrc_dir=$(python3 -c "import json; print(json.load(open('$_AHGRC_FILE')).get('line_check_dir', '.'))" 2>/dev/null || echo "")
    _ahgrc_skip=$(python3 -c "import json; d=json.load(open('$_AHGRC_FILE')); print(' '.join(d.get('line_check_skip', [])))" 2>/dev/null || echo "")
    _ahgrc_glob=$(python3 -c "import json; d=json.load(open('$_AHGRC_FILE')); print(' '.join(d.get('line_check_glob', [])))" 2>/dev/null || echo "")

    # Apply .ahgrc values as defaults (env vars still override)
    LINE_LIMIT="${LINE_LIMIT:-${_ahgrc_limit:-250}}"
    LINE_CHECK_DIR="${LINE_CHECK_DIR:-${_ahgrc_dir:-.}}"
    LINE_HARD_CAP="${LINE_HARD_CAP:-${_ahgrc_cap:-400}}"
    if [ -z "${LINE_CHECK_GLOB:-}" ] && [ -n "$_ahgrc_glob" ]; then
        LINE_CHECK_GLOB="$_ahgrc_glob"
    fi
    if [ -z "${LINE_CHECK_SKIP:-}" ] && [ -n "$_ahgrc_skip" ]; then
        LINE_CHECK_SKIP="$_ahgrc_skip"
    fi
fi

# -- Configuration (overridable via env, falls back to .ahgrc then defaults) --
LINE_LIMIT="${LINE_LIMIT:-250}"
LINE_HARD_CAP="${LINE_HARD_CAP:-400}"
LINE_CHECK_DIR="${LINE_CHECK_DIR:-.}"
# Guard: empty string is NOT the same as unset -- ${:-} only substitutes on unset/null.
# When pre-commit passes LINE_CHECK_DIR="" for AHG standalone, find "" fails.
[ -z "$LINE_CHECK_DIR" ] && LINE_CHECK_DIR="."

# Source file patterns to check (space-separated globs)
# Covers most common programming languages
LINE_CHECK_GLOB="${LINE_CHECK_GLOB:-*.js *.ts *.jsx *.tsx *.py *.go *.rs *.java *.rb *.sh *.bash *.zsh *.c *.cpp *.h *.hpp *.cs *.php *.swift *.kt *.scala}"

# Patterns to skip (grep -v patterns)
LINE_CHECK_SKIP="${LINE_CHECK_SKIP:-node_modules .git vendor dist build .next coverage __pycache__ anti-hallucination-guard}"

# -- Colors --
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()  { echo -e "${RED}[ERR]${NC} $*"; }

# -- Main --
VIOLATIONS=0
WARNINGS=0
CHECKED=0

# Resolve project root
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$PROJECT_ROOT"

# Resolve LINE_CHECK_DIR to absolute path for relative-path skip matching
_lc_base_dir="$(cd "$LINE_CHECK_DIR" 2>/dev/null && pwd || echo "$PROJECT_ROOT")"
[ -n "$_lc_base_dir" ] || _lc_base_dir="$PROJECT_ROOT"

# Build find command with patterns
# We use find + file extension matching for cross-platform compatibility
# IMPORTANT: Disable glob expansion so "*.sh" stays as a pattern for find,
# not expanded to "setup.sh update.sh" by bash word splitting.
set -f
for GLOB in $LINE_CHECK_GLOB; do
    # Strip the * prefix for find -name
    FIND_NAME="$GLOB"

    while IFS= read -r -d '' FILE; do
        # Skip patterns -- match against path RELATIVE to LINE_CHECK_DIR,
        # not the absolute path. When LINE_CHECK_DIR points inside
        # "anti-hallucination-guard/" (submodule mode), the absolute path
        # contains "anti-hallucination-guard" which would falsely match
        # the skip pattern and skip ALL files.
        REL_PATH="${FILE#$_lc_base_dir}"
        REL_PATH="${REL_PATH#/}"  # strip leading slash

        SKIP_FLAG=0
        for SKIP_PAT in $LINE_CHECK_SKIP; do
            case "$REL_PATH" in
                *"$SKIP_PAT"*) SKIP_FLAG=1; break ;;
            esac
        done

        if [ "$SKIP_FLAG" -eq 1 ]; then
            continue
        fi

        # Count lines
        LINES=$(wc -l < "$FILE" 2>/dev/null || echo "0")
        # Trim whitespace
        LINES=$(echo "$LINES" | tr -d '[:space:]')

        CHECKED=$((CHECKED + 1))

        if [ "$LINES" -gt "$LINE_HARD_CAP" ]; then
            # Hard violation -- no exceptions
            err "[ANTI-MONOLITH] $FILE is ${LINES} lines (limit: ${LINE_LIMIT}, hard cap: ${LINE_HARD_CAP})"
            err "  DECOMPOSE IMMEDIATELY. No exceptions above 400 lines."
            VIOLATIONS=$((VIOLATIONS + 1))
        elif [ "$LINES" -gt "$LINE_LIMIT" ]; then
            # Over recommended limit -- check for documented exception
            if head -5 "$FILE" | grep -qi "ANTI-MONOLITH.*exception\|anti-monolith.*exempt\|generated.*file\|auto-generated\|@generated" 2>/dev/null; then
                # Documented exception -- warn only
                warn "[ANTI-MONOLITH] $FILE is ${LINES} lines (exempted: documented exception)"
                WARNINGS=$((WARNINGS + 1))
            else
                # No exception documented -- violation
                err "[ANTI-MONOLITH] $FILE is ${LINES} lines (limit: ${LINE_LIMIT})"
                err "  Split this file or add documented exception comment."
                err "  Rule 12: one file = one responsibility. Extract sub-modules."
                VIOLATIONS=$((VIOLATIONS + 1))
            fi
        fi
    done < <(find "$LINE_CHECK_DIR" -type f -name "$FIND_NAME" -print0 2>/dev/null)
done
set +f

# -- Report --
echo ""
if [ "$VIOLATIONS" -gt 0 ]; then
    echo -e "  ${RED}[ANTI-MONOLITH] ${VIOLATIONS} violation(s) found.${NC}"
    echo -e "  ${RED}Fix: decompose files to stay under ${LINE_LIMIT} lines.${NC}"
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "  ${YELLOW}Plus ${WARNINGS} exempted file(s) (documented exceptions).${NC}"
    fi
    echo ""
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo -e "  ${YELLOW}[ANTI-MONOLITH] ${WARNINGS} exempted file(s) over ${LINE_LIMIT} lines.${NC}"
    echo -e "  ${GREEN}No violations. Checked ${CHECKED} files.${NC}"
    exit 0
else
    ok "[ANTI-MONOLITH] All ${CHECKED} files under ${LINE_LIMIT} lines"
    exit 0
fi
