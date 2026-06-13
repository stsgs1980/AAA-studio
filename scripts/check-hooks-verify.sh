#!/bin/bash
# ============================================================
# anti-hallucination-guard / check-hooks-verify.sh
#
# Verifies that git hooks and key configuration files have not
# been tampered with by an AI agent or other actor.
#
# This is the LAST line of defense against agents that:
#   - Modify .git/hooks/pre-commit to bypass worklog checks
#   - Remove rules from AGENT_RULES.md
#   - Remove checks from verify-docs.json
#   - Change core.hooksPath to skip hooks entirely
#
# Run:
#   bash scripts/check-hooks-verify.sh            # check now
#   bash scripts/check-hooks-verify.sh --repair    # re-install hooks
#
# Used by: pre-commit hook, CI pipeline, manual audit
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=check-hooks-lib.sh
source "$SCRIPT_DIR/check-hooks-lib.sh"

# -- Check integrity ----------------------------------------------------------
check_integrity() {
  local ERRORS=0

  if [ ! -f "$STATE_FILE" ]; then
    warn "No integrity snapshot found. Run: bash scripts/check-hooks-snapshot.sh --snapshot"
    check_basic
    return $?
  fi

  if ! command -v jq &>/dev/null; then
    warn "jq not available, doing basic checks only"
    check_basic
    return $?
  fi

  # -- Anti-tampering: compare snapshot against git HEAD version ---------------
  if git -C "$PROJECT_ROOT" rev-parse --git-dir >/dev/null 2>&1; then
    local committed_snapshot
    committed_snapshot=$(git -C "$PROJECT_ROOT" show HEAD:.ahg-integrity.json 2>/dev/null || true)
    if [ -n "$committed_snapshot" ]; then
      local local_hash committed_hash
      local_hash=$(fingerprint "$STATE_FILE")
      committed_hash=$(echo "$committed_snapshot" | fingerprint /dev/stdin 2>/dev/null || true)
      if [ -n "$committed_hash" ] && [ "$local_hash" != "$committed_hash" ]; then
        warn ".ahg-integrity.json: LOCAL differs from git HEAD (modified since last commit)"
        echo "  This is expected after --snapshot. Commit the new snapshot."
        echo "  If you did NOT run --snapshot, this may indicate tampering."
      fi
    fi
  fi

  info "Checking integrity against snapshot..."

  # Check pre-commit hook fingerprint
  local expected_pc
  expected_pc=$(jq -r '.hooks["pre-commit"]' "$STATE_FILE" 2>/dev/null)
  local actual_pc
  actual_pc=$(fingerprint "$PROJECT_ROOT/.git/hooks/pre-commit" 2>/dev/null || echo "missing")

  if [ "$expected_pc" = "missing" ] || [ "$actual_pc" = "missing" ]; then
    fail "pre-commit hook: MISSING"
    ERRORS=$((ERRORS + 1))
  elif [ "$expected_pc" != "$actual_pc" ]; then
    fail "pre-commit hook: FINGERPRINT MISMATCH (tampered or replaced!)"
    echo "  Expected: $expected_pc"
    echo "  Actual:   $actual_pc"
    ERRORS=$((ERRORS + 1))
  else
    ok "pre-commit hook: intact"
  fi

  # Check pre-push hook fingerprint
  local expected_pp
  expected_pp=$(jq -r '.hooks["pre-push"]' "$STATE_FILE" 2>/dev/null)
  local actual_pp
  actual_pp=$(fingerprint "$PROJECT_ROOT/.git/hooks/pre-push" 2>/dev/null || echo "missing")

  if [ "$expected_pp" = "missing" ] || [ "$actual_pp" = "missing" ]; then
    warn "pre-push hook: MISSING (not critical for commit)"
  elif [ "$expected_pp" != "$actual_pp" ]; then
    fail "pre-push hook: FINGERPRINT MISMATCH (tampered or replaced!)"
    ERRORS=$((ERRORS + 1))
  else
    ok "pre-push hook: intact"
  fi

  # Check AGENT_RULES.md fingerprint
  local expected_ar
  expected_ar=$(jq -r '.config["AGENT_RULES.md"]' "$STATE_FILE" 2>/dev/null)
  local actual_ar
  actual_ar=$(fingerprint "$PROJECT_ROOT/AGENT_RULES.md" 2>/dev/null || echo "missing")

  if [ "$expected_ar" = "missing" ] || [ "$actual_ar" = "missing" ]; then
    fail "AGENT_RULES.md: MISSING"
    ERRORS=$((ERRORS + 1))
  elif [ "$expected_ar" != "$actual_ar" ]; then
    warn "AGENT_RULES.md: MODIFIED (fingerprint changed)"
    echo "  This may be intentional (rule updates) or tampering (rule removal)."
    echo "  If intentional: re-run --snapshot after changes."
  else
    ok "AGENT_RULES.md: intact"
  fi

  # Check verify-docs.json fingerprint
  local expected_vd
  expected_vd=$(jq -r '.config["verify-docs.json"]' "$STATE_FILE" 2>/dev/null)
  local actual_vd
  actual_vd=$(fingerprint "$PROJECT_ROOT/verify-docs.json" 2>/dev/null || echo "missing")

  if [ "$expected_vd" = "missing" ] && [ "$actual_vd" != "missing" ]; then
    warn "verify-docs.json: NEW (not in snapshot)"
  elif [ "$expected_vd" != "missing" ] && [ "$actual_vd" = "missing" ]; then
    fail "verify-docs.json: DELETED (was in snapshot)"
    ERRORS=$((ERRORS + 1))
  elif [ "$expected_vd" != "$actual_vd" ]; then
    warn "verify-docs.json: MODIFIED (checks may have been removed)"
    echo "  If intentional: re-run --snapshot after changes."
  else
    ok "verify-docs.json: intact"
  fi

  # Check core.hooksPath
  local expected_hp
  expected_hp=$(jq -r '.gitConfig["core.hooksPath"]' "$STATE_FILE" 2>/dev/null)
  local actual_hp
  actual_hp=$(git -C "$PROJECT_ROOT" config --get core.hooksPath 2>/dev/null || echo "unset")

  if [ "$actual_hp" != "unset" ] && [ "$actual_hp" != "" ]; then
    fail "core.hooksPath is SET to '$actual_hp' -- hooks may be bypassed!"
    ERRORS=$((ERRORS + 1))
  else
    ok "core.hooksPath: unset (hooks will run)"
  fi

  return $ERRORS
}

# -- Basic checks (without snapshot) ------------------------------------------
check_basic() {
  local ERRORS=0

  info "Running basic integrity checks (no snapshot)..."

  # Check hooks exist
  if [ -f "$PROJECT_ROOT/.git/hooks/pre-commit" ]; then
    if grep -q "worklog" "$PROJECT_ROOT/.git/hooks/pre-commit" 2>/dev/null; then
      ok "pre-commit hook: contains worklog check"
    else
      fail "pre-commit hook: DOES NOT contain worklog check (tampered!)"
      ERRORS=$((ERRORS + 1))
    fi
  else
    fail "pre-commit hook: MISSING"
    ERRORS=$((ERRORS + 1))
  fi

  # Check AGENT_RULES.md has AHG markers
  if [ -f "$PROJECT_ROOT/AGENT_RULES.md" ]; then
    if grep -q "AHG:START" "$PROJECT_ROOT/AGENT_RULES.md" 2>/dev/null; then
      ok "AGENT_RULES.md: contains AHG markers"
    else
      fail "AGENT_RULES.md: AHG markers REMOVED (rules may have been deleted)"
      ERRORS=$((ERRORS + 1))
    fi
  else
    fail "AGENT_RULES.md: MISSING"
    ERRORS=$((ERRORS + 1))
  fi

  # Check core.hooksPath
  local hp
  hp=$(git -C "$PROJECT_ROOT" config --get core.hooksPath 2>/dev/null || echo "unset")
  if [ "$hp" != "unset" ] && [ "$hp" != "" ]; then
    fail "core.hooksPath = '$hp' -- hooks bypassed!"
    ERRORS=$((ERRORS + 1))
  else
    ok "core.hooksPath: unset"
  fi

  return $ERRORS
}

# -- Repair hooks from module -------------------------------------------------
repair() {
  if ! detect_module; then
    fail "Cannot find anti-hallucination-guard module directory"
    exit 1
  fi

  info "Repairing hooks from module at $MODULE_ROOT..."

  # Re-install pre-commit
  if [ -f "$MODULE_ROOT/.git-hooks/pre-commit" ]; then
    cp "$MODULE_ROOT/.git-hooks/pre-commit" "$PROJECT_ROOT/.git/hooks/pre-commit"
    chmod +x "$PROJECT_ROOT/.git/hooks/pre-commit"
    ok "pre-commit hook re-installed"
  fi

  # Re-install pre-push
  if [ -f "$MODULE_ROOT/.git-hooks/pre-push" ]; then
    cp "$MODULE_ROOT/.git-hooks/pre-push" "$PROJECT_ROOT/.git/hooks/pre-push"
    chmod +x "$PROJECT_ROOT/.git/hooks/pre-push"
    ok "pre-push hook re-installed"
  fi

  # Re-run setup.sh for full repair
  info "Running full setup.sh for complete repair..."
  bash "$MODULE_ROOT/setup.sh"

  # Re-create snapshot (source snapshot script for save_snapshot function)
  # shellcheck source=check-hooks-snapshot.sh
  source "$SCRIPT_DIR/check-hooks-snapshot.sh"
  save_snapshot

  ok "Repair complete"
}

# -- Main ---------------------------------------------------------------------

case "${1:-check}" in
  --check|check|"")
    if check_integrity; then
      echo ""
      ok "All integrity checks passed"
      exit 0
    else
      echo ""
      fail "Integrity checks FAILED"
      echo "  Run: bash scripts/check-hooks-verify.sh --repair"
      echo "  Or: bash anti-hallucination-guard/setup.sh"
      exit 1
    fi
    ;;
  --repair|-r)
    repair
    ;;
  *)
    echo "Usage: $0 [--check|--repair]"
    exit 1
    ;;
esac
