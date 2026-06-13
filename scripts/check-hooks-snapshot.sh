#!/bin/bash
# ============================================================
# anti-hallucination-guard / check-hooks-snapshot.sh
#
# Creates an integrity snapshot of git hooks and configuration
# files. The snapshot stores SHA256 fingerprints so that later
# verification (check-hooks-verify.sh) can detect tampering.
#
# Run:
#   bash scripts/check-hooks-snapshot.sh --snapshot
#   bash scripts/check-hooks-snapshot.sh -s
#
# Used by:
#   - CI pipeline (after initial setup)
#   - Manual audit
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=check-hooks-lib.sh
source "$SCRIPT_DIR/check-hooks-lib.sh"

# -- Save fingerprints ---------------------------------------------------------
save_snapshot() {
  info "Creating integrity snapshot..."

  if ! detect_module; then
    fail "Cannot find anti-hallucination-guard module directory"
    exit 1
  fi

  cat > "$STATE_FILE" << JSONEOF
{
  "version": 1,
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "hooks": {
    "pre-commit": "$(fingerprint "$PROJECT_ROOT/.git/hooks/pre-commit" 2>/dev/null || echo "missing")",
    "pre-push": "$(fingerprint "$PROJECT_ROOT/.git/hooks/pre-push" 2>/dev/null || echo "missing")"
  },
  "config": {
    "AGENT_RULES.md": "$(fingerprint "$PROJECT_ROOT/AGENT_RULES.md" 2>/dev/null || echo "missing")",
    "verify-docs.json": "$(fingerprint "$PROJECT_ROOT/verify-docs.json" 2>/dev/null || echo "missing")"
  },
  "gitConfig": {
    "core.hooksPath": "$(git -C "$PROJECT_ROOT" config --get core.hooksPath 2>/dev/null || echo "unset")"
  },
  "moduleSetup": "$(fingerprint "$MODULE_ROOT/setup.sh" 2>/dev/null || echo "missing")"
}
JSONEOF

  ok "Snapshot saved: $STATE_FILE"
}

# -- Main (only when executed directly, not sourced) --------------------------

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  case "${1:-}" in
    --snapshot|-s)
      save_snapshot
      ;;
    *)
      echo "Usage: $0 --snapshot|-s"
      exit 1
      ;;
  esac
fi
