#!/bin/bash
# ============================================================
# anti-hallucination-guard / ahg.sh
# Unified CLI entry point for all AHG commands.
#
# Usage: bash scripts/ahg.sh <command> [args]
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# Resolve PROJECT_ROOT: if AHG is a submodule, git toplevel = consumer root
# If standalone, git toplevel = MODULE_ROOT itself
PROJECT_ROOT="$(git -C "$MODULE_ROOT" rev-parse --show-toplevel 2>/dev/null || echo "$MODULE_ROOT")"

# -- Find the real AHG module directory --------------------------------------
# When ahg.sh is deployed to a consumer project's scripts/ dir,
# MODULE_ROOT points to the consumer project root, NOT the AHG module.
# verify-docs lives inside the AHG module, so we need to find it.
AHG_MODULE_DIR=""

# Quick check: if MODULE_ROOT has setup.sh, we ARE the AHG module repo
if [ -f "$MODULE_ROOT/setup.sh" ] && [ -f "$MODULE_ROOT/AGENT_RULES.md" ]; then
    AHG_MODULE_DIR="$MODULE_ROOT"
fi

# If not found, search for the AHG submodule in the consumer project
if [ -z "$AHG_MODULE_DIR" ]; then
    # Check .gitmodules for AHG submodule path
    if [ -f "$PROJECT_ROOT/.gitmodules" ]; then
        _ahg_sp=$(git -C "$PROJECT_ROOT" config -f .gitmodules --get-regexp 'path' 2>/dev/null \
            | grep -i 'anti.hallucination' | awk '{print $2}' | head -1 || true)
        if [ -n "$_ahg_sp" ] && [ -f "$PROJECT_ROOT/$_ahg_sp/setup.sh" ]; then
            AHG_MODULE_DIR="$PROJECT_ROOT/$_ahg_sp"
        fi
    fi
fi

# Check common locations
if [ -z "$AHG_MODULE_DIR" ]; then
    for _ahg_c in \
        "$PROJECT_ROOT/anti-hallucination-guard" \
        "$PROJECT_ROOT/vendor/anti-hallucination-guard" \
        "$PROJECT_ROOT/lib/anti-hallucination-guard"; do
        if [ -d "$_ahg_c" ] && [ -f "$_ahg_c/setup.sh" ]; then
            AHG_MODULE_DIR="$_ahg_c"
            break
        fi
    done
fi

# Set VD_CLI/VD_INIT based on the real AHG module location
if [ -n "$AHG_MODULE_DIR" ]; then
    VD_CLI="$AHG_MODULE_DIR/tools/verify-docs/src/cli.ts"
    VD_INIT="$AHG_MODULE_DIR/tools/verify-docs/src/init.ts"
else
    # Fallback: use MODULE_ROOT (may be wrong for deployed scripts,
    # but check_vd() will give a clear error message)
    VD_CLI="$MODULE_ROOT/tools/verify-docs/src/cli.ts"
    VD_INIT="$MODULE_ROOT/tools/verify-docs/src/init.ts"
fi

# -- Verify prerequisites -----------------------------------------------------
if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    echo ""
    echo "ahg -- Anti-Hallucination Guard CLI v2.1"
    echo ""
    echo "USAGE"
    echo "  bash scripts/ahg.sh <command> [args]"
    echo ""
    echo "COMMANDS"
    echo "  verify [--ci]           Verify docs (auto-discover if no config!)"
    echo "  discover                Auto-scan project (no config needed)"
    echo "  bump <version>          Update version in all files"
    echo "  bump <version> --dry-run   Preview bump without writing"
    echo "  init                    Generate verify-docs.json"
    echo "  baseline                Create .ahg-baseline.json"
    echo "  baseline --check        Check current files vs baseline"
    echo "  snapshot [--snapshot]   Manage hook integrity snapshots"
    echo "  integrity [--repair]    Check or repair hook integrity"
    echo "  sync [--dry-run]        Auto-sync task statuses"
    echo "  audit                   Post-session audit"
    echo "  validate                Repository purity check"
    echo ""
    echo "EXAMPLES"
    echo "  bash scripts/ahg.sh discover"
    echo "  bash scripts/ahg.sh bump 2.0.0"
    echo "  bash scripts/ahg.sh verify --ci"
    echo ""
    exit 0
fi

# -- Helper: check bun --------------------------------------------------------
check_bun() {
    if ! command -v bun &>/dev/null; then
        echo "ahg: bun is required. Install: https://bun.sh"
        exit 1
    fi
}

# -- Helper: check verify-docs ------------------------------------------------
check_vd() {
    if [ ! -f "$VD_CLI" ]; then
        echo "ahg: verify-docs not found at $VD_CLI"
        echo "     MODULE_ROOT=$MODULE_ROOT"
        if [ -n "${AHG_MODULE_DIR:-}" ]; then
            echo "     AHG_MODULE_DIR=$AHG_MODULE_DIR"
        else
            echo "     AHG module not found (searched .gitmodules, common paths)"
        fi
        echo "     Run: bash anti-hallucination-guard/setup.sh"
        exit 1
    fi
}

# -- Fix CWD: always run from project root ------------------------------------
cd "$PROJECT_ROOT"

# -- Command router -----------------------------------------------------------
case "${1:-}" in
  verify)
    shift
    check_bun && check_vd
    bun run "$VD_CLI" "$@"
    ;;

  discover)
    shift
    check_bun && check_vd
    bun run "$VD_CLI" --discover "$@"
    ;;

  bump)
    shift
    check_bun && check_vd
    if [ -z "${1:-}" ]; then
        echo "ahg bump: version required (e.g. ahg bump 2.0.0)"
        exit 1
    fi
    bun run "$VD_CLI" --bump="$1" "${@:2}"
    ;;

  init)
    shift
    check_bun && check_vd
    bun run "$VD_CLI" --init "$@"
    ;;

  baseline)
    shift
    check_bun && check_vd
    if echo "$@" | grep -q "\-\-check"; then
        bun run "$VD_CLI" --baseline --check "$@"
    else
        bun run "$VD_CLI" --baseline "$@"
    fi
    ;;

  snapshot)
    shift
    if [ -f "$SCRIPT_DIR/check-hooks-snapshot.sh" ]; then
        bash "$SCRIPT_DIR/check-hooks-snapshot.sh" --snapshot "$@"
    else
        echo "ahg: check-hooks-snapshot.sh not found"
        exit 1
    fi
    ;;

  integrity)
    shift
    if [ -f "$SCRIPT_DIR/check-hooks-verify.sh" ]; then
        bash "$SCRIPT_DIR/check-hooks-verify.sh" "$@"
    elif [ -f "$SCRIPT_DIR/check-hooks-integrity.sh" ]; then
        bash "$SCRIPT_DIR/check-hooks-integrity.sh" "$@"
    else
        echo "ahg: integrity check script not found"
        exit 1
    fi
    ;;

  sync)
    shift
    if [ -f "$SCRIPT_DIR/sync-task-state.sh" ]; then
        bash "$SCRIPT_DIR/sync-task-state.sh" "$@"
    else
        echo "ahg: sync-task-state.sh not found"
        exit 1
    fi
    ;;

  audit)
    shift
    if [ -f "$SCRIPT_DIR/audit.sh" ]; then
        bash "$SCRIPT_DIR/audit.sh" "$@"
    else
        echo "ahg: audit.sh not found"
        exit 1
    fi
    ;;

  validate)
    shift
    if [ -f "$SCRIPT_DIR/validate.sh" ]; then
        bash "$SCRIPT_DIR/validate.sh" "$@"
    else
        echo "ahg: validate.sh not found"
        exit 1
    fi
    ;;

  *)
    echo "ahg: unknown command '${1:-}'"
    echo "Run: bash scripts/ahg.sh --help"
    exit 1
    ;;
esac
