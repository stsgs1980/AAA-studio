#!/usr/bin/env bash
#
# cascade-init.sh — Generate cascade-state.json from a simple project description
#
# Usage:
#   ./cascade-init.sh                          — Interactive mode (prompts for project info)
#   ./cascade-init.sh --from-file PROJECT.yaml  — Generate from YAML/JSON description
#   ./cascade-init.sh --from-json '{...}'       — Generate from inline JSON
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

# ---- Interactive mode ----
interactive_mode() {
    echo ""
    echo "============================================"
    echo "  CASCADE-GUARD — Project Initializer"
    echo "============================================"
    echo ""

    read -rp "Project name: " PROJECT_NAME
    read -rp "Repository URL (optional): " REPO_URL
    REPO_URL="${REPO_URL:-N/A}"
    read -rp "Version (e.g. 1.0.0): " VERSION
    VERSION="${VERSION:-0.1.0}"
    read -rp "Date (YYYY-MM-DD, press Enter for today): " DATE
    DATE="${DATE:-$(date +%Y-%m-%d)}"

    echo ""
    echo "--- Phases ---"
    echo "Enter phases one by one. Empty name to finish."
    echo ""

    PHASES_JSON="[]"
    PHASE_IDX=0
    while true; do
        PHASE_IDX=$((PHASE_IDX + 1))
        read -rp "Phase $PHASE_IDX name (empty to finish): " PHASE_NAME
        [ -z "$PHASE_NAME" ] && break

        read -rp "Phase $PHASE_IDX gate rule (e.g. 'All P0 tasks must be completed'): " GATE_RULE
        GATE_RULE="${GATE_RULE:-All tasks must be completed before next phase}"

        echo "  Enter tasks for Phase $PHASE_IDX. Empty ID to finish."
        TASKS_JSON="[]"
        TASK_COUNT=0
        while true; do
            TASK_COUNT=$((TASK_COUNT + 1))
            read -rp "    Task $TASK_COUNT ID (e.g. F0.1, empty to finish): " TASK_ID
            [ -z "$TASK_ID" ] && break

            read -rp "    Task $TASK_COUNT title: " TASK_TITLE
            read -rp "    Priority (P0/P1/P2) [P1]: " TASK_PRIORITY
            TASK_PRIORITY="${TASK_PRIORITY:-P1}"
            read -rp "    Size (S/M/L) [S]: " TASK_SIZE
            TASK_SIZE="${TASK_SIZE:-S}"
            read -rp "    Depends on (comma-separated, e.g. F0.1,F0.2 or empty): " TASK_DEPS
            if [ -z "$TASK_DEPS" ]; then
                TASK_DEPS_JSON="[]"
            else
                # Split by comma and build JSON array
                TASK_DEPS_JSON=$(echo "$TASK_DEPS" | tr ',' '\n' | sed 's/^ *//;s/ *$//' | jq -R . | jq -s .)
            fi
            read -rp "    Implements functions (comma-separated, e.g. F-OV-01,F-VC-05 or empty): " TASK_IMPL
            if [ -z "$TASK_IMPL" ]; then
                TASK_IMPL_JSON="[]"
            else
                TASK_IMPL_JSON=$(echo "$TASK_IMPL" | tr ',' '\n' | sed 's/^ *//;s/ *$//' | jq -R . | jq -s .)
            fi
            read -rp "    Acceptance criteria: " TASK_ACCEPTANCE
            read -rp "    Anti-hallucination checks: " TASK_ANTI_HALL

            TASK_JSON=$(jq -n \
                --arg id "$TASK_ID" \
                --arg title "$TASK_TITLE" \
                --arg priority "$TASK_PRIORITY" \
                --arg size "$TASK_SIZE" \
                --argjson depends_on "$TASK_DEPS_JSON" \
                --argjson implements "$TASK_IMPL_JSON" \
                --arg acceptance "$TASK_ACCEPTANCE" \
                --arg anti_hallucination "$TASK_ANTI_HALL" \
                '{
                    id: $id,
                    title: $title,
                    priority: $priority,
                    size: $size,
                    status: "pending",
                    depends_on: $depends_on,
                    implements: $implements,
                    acceptance: $acceptance,
                    anti_hallucination: $anti_hallucination
                }'
            )
            TASKS_JSON=$(echo "$TASKS_JSON" | jq --argjson task "$TASK_JSON" '. + [$task]')
        done

        PHASE_JSON=$(jq -n \
            --arg id "P$((PHASE_IDX - 1))" \
            --arg name "$PHASE_NAME" \
            --arg gate "$GATE_RULE" \
            --argjson tasks "$TASKS_JSON" \
            '{
                id: $id,
                name: $name,
                gate: $gate,
                tasks: $tasks
            }'
        )
        PHASES_JSON=$(echo "$PHASES_JSON" | jq --argjson phase "$PHASE_JSON" '. + [$phase]')
    done

    # ---- Function inventory ----
    echo ""
    echo "--- Function Inventory ---"
    echo "Enter product functions (user-visible features). Empty ID to finish."
    echo ""
    FUNC_JSON="[]"
    while true; do
        read -rp "Function ID (e.g. F-OV-01, empty to finish): " FUNC_ID
        [ -z "$FUNC_ID" ] && break
        read -rp "Function name: " FUNC_NAME
        read -rp "Tab/Module: " FUNC_TAB
        read -rp "Status (Works/Partial/Stub): " FUNC_STATUS
        FUNC_STATUS="${FUNC_STATUS:-Stub}"
        read -rp "Priority (P0/P1/P2) [P1]: " FUNC_PRIORITY
        FUNC_PRIORITY="${FUNC_PRIORITY:-P1}"
        read -rp "Depends on functions (comma-sep or empty): " FUNC_DEPS
        if [ -z "$FUNC_DEPS" ]; then
            FUNC_DEPS_JSON="[]"
        else
            FUNC_DEPS_JSON=$(echo "$FUNC_DEPS" | tr ',' '\n' | sed 's/^ *//;s/ *$//' | jq -R . | jq -s .)
        fi
        read -rp "Implemented by cascade tasks (comma-sep or empty): " FUNC_IMPL_BY
        if [ -z "$FUNC_IMPL_BY" ]; then
            FUNC_IMPL_BY_JSON="[]"
        else
            FUNC_IMPL_BY_JSON=$(echo "$FUNC_IMPL_BY" | tr ',' '\n' | sed 's/^ *//;s/ *$//' | jq -R . | jq -s .)
        fi

        FUNC_ENTRY=$(jq -n \
            --arg id "$FUNC_ID" \
            --arg name "$FUNC_NAME" \
            --arg tab "$FUNC_TAB" \
            --arg status "$FUNC_STATUS" \
            --arg priority "$FUNC_PRIORITY" \
            --argjson depends_on "$FUNC_DEPS_JSON" \
            --argjson implemented_by "$FUNC_IMPL_BY_JSON" \
            '{
                id: $id,
                name: $name,
                tab: $tab,
                status: $status,
                priority: $priority,
                depends_on: $depends_on,
                implemented_by: $implemented_by
            }'
        )
        FUNC_JSON=$(echo "$FUNC_JSON" | jq --argjson entry "$FUNC_ENTRY" '. + [$entry]')
    done

    # ---- Build final JSON ----
    jq -n \
        --arg name "$PROJECT_NAME" \
        --arg repo "$REPO_URL" \
        --arg version "$VERSION" \
        --arg date "$DATE" \
        --argjson phases "$PHASES_JSON" \
        --argjson functions "$FUNC_JSON" \
        '{
            _meta: {
                version: $version,
                project: $name,
                repo: $repo,
                lastUpdated: ($date + "T00:00:00Z"),
                description: "Single source of truth for cascade task execution. AI agents MUST read this file before starting any work."
            },
            phases: $phases,
            functionInventory: $functions
        }' > "$OUTPUT"

    ok "Generated $OUTPUT"
    info "Tasks: $(jq '[.phases[].tasks] | flatten | length' "$OUTPUT")"
    info "Functions: $(jq '.functionInventory | length' "$OUTPUT")"
    info "Next: run 'cascade-cli.sh validate' to verify integrity"
}

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
        echo "cascade-init.sh — Generate cascade-state.json"
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
