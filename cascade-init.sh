#!/usr/bin/env bash
#
# cascade-init.sh -- Generate cascade-state.json from a simple project description
#
# Usage:
#   ./cascade-init.sh                          -- Interactive mode (prompts for project info)
#   ./cascade-init.sh --from-file PROJECT.yaml  -- Generate from YAML/JSON description
#   ./cascade-init.sh --from-json '{...}'       -- Generate from inline JSON
#
# The generated cascade-state.json is the single source of truth for task execution.
# AI agents read this file to know what to work on next.
#
set -euo pipefail

# ---- Color helpers ----
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}[INFO]${NC} $*"; }
ok()    { echo -e "${GREEN}[OK]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
err()   { echo -e "${RED}[ERROR]${NC} $*"; }

# ---- Check deps ----
if ! command -v jq &>/dev/null; then
    err "jq is required. Install: apt-get install jq"
    exit 1
fi

OUTPUT="${1:-cascade-state.json}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/cascade-init-interactive.sh"

# ---- From JSON file ----
from_file_mode() {
    local input_file="$1"
    local output="${2:-cascade-state.json}"

    if [ ! -f "$input_file" ]; then
        err "File not found: $input_file"
        exit 1
    fi

    # Validate it has the minimum required structure
    if ! jq -e '.phases | length > 0' "$input_file" &>/dev/null; then
        err "Input must have at least one phase with tasks"
        exit 1
    fi

    # Add _meta if missing, ensure all tasks have status
    jq '
        if ._meta == null then ._meta = {} else . end |
        ._meta.lastUpdated = (now | todate) |
        .phases[].tasks |= map(
            if .status == null then .status = "pending" else . end |
            if .depends_on == null then .depends_on = [] else . end |
            if .implements == null then .implements = [] else . end
        )
    ' "$input_file" > "$output"

    ok "Generated $output from $input_file"
}

# ---- Main ----
case "${1:-interactive}" in
    interactive)
        interactive_mode
        ;;
    --from-file)
        from_file_mode "${2:-}" "${3:-cascade-state.json}"
        ;;
    --from-json)
        echo "${2:-}" | jq '.' > /tmp/cascade-input.json
        from_file_mode /tmp/cascade-input.json "${3:-cascade-state.json}"
        rm -f /tmp/cascade-input.json
        ;;
    -h|--help|help)
        echo "cascade-init.sh -- Generate cascade-state.json"
        echo ""
        echo "Usage:"
        echo "  ./cascade-init.sh                            Interactive mode"
        echo "  ./cascade-init.sh --from-file project.yaml   From existing file"
        echo "  ./cascade-init.sh --from-json '{...}'         From inline JSON"
        echo "  ./cascade-init.sh -h                         This help"
        ;;
    *)
        # If argument looks like a filename, use it as output
        OUTPUT="$1"
        interactive_mode
        ;;
esac