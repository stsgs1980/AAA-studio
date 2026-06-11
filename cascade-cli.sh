#!/usr/bin/env bash
#
# cascade-cli.sh - CLI tool for AI agents to navigate the task cascade
#
# Usage:
#   ./cascade-cli.sh next-task          — Show the next ready task to work on
#   ./cascade-cli.sh ready-tasks        — List all tasks ready to start
#   ./cascade-cli.sh complete-task ID   — Mark a task as completed
#   ./cascade-cli.sh start-task ID      — Mark a task as in_progress
#   ./cascade-cli.sh block-task ID REASON — Mark a task as blocked with reason
#   ./cascade-cli.sh status             — Show overall cascade status
#   ./cascade-cli.sh deps ID            — Show dependencies for a task
#   ./cascade-cli.sh implements ID      — Show which functions a task implements
#   ./cascade-cli.sh validate           — Validate cascade-state.json integrity
#

set -euo pipefail

STATE_FILE="$(dirname "$0")/cascade-state.json"

# Check dependencies
if ! command -v jq &>/dev/null; then
    echo "ERROR: jq is required. Install with: apt-get install jq"
    exit 1
fi

if [ ! -f "$STATE_FILE" ]; then
    echo "ERROR: cascade-state.json not found at $STATE_FILE"
    exit 1
fi

# ---- Helper functions ----

get_task_status() {
    local task_id="$1"
    jq -r --arg id "$task_id" '
        [.phases[].tasks[] | select(.id == $id)][0].status // "not_found"
    ' "$STATE_FILE"
}

get_task_field() {
    local task_id="$1"
    local field="$2"
    jq -r --arg id "$task_id" --arg field "$field" '
        [.phases[].tasks[] | select(.id == $id)][0][$field] // "null"
    ' "$STATE_FILE"
}

are_deps_completed() {
    local task_id="$1"
    local deps
    deps=$(jq -r --arg id "$task_id" '
        [.phases[].tasks[] | select(.id == $id)][0].depends_on[]?
    ' "$STATE_FILE")
    
    if [ -z "$deps" ]; then
        echo "yes"
        return
    fi
    
    for dep in $deps; do
        local dep_status
        dep_status=$(get_task_status "$dep")
        if [ "$dep_status" != "completed" ]; then
            echo "no"
            return
        fi
    done
    echo "yes"
}

get_blocked_by() {
    local task_id="$1"
    jq -r --arg id "$task_id" '
        [.phases[].tasks[] | select(.id == $id)][0].depends_on[]? as $dep |
        {id: $dep, status: ([.phases[].tasks[] | select(.id == $dep)][0].status // "not_found")} |
        select(.status != "completed") |
        "\(.id) (\(.status))"
    ' "$STATE_FILE" | tr '\n' ',' | sed 's/,$//'
}

# ---- Commands ----

cmd_next_task() {
    echo "=== NEXT READY TASK (by priority) ==="
    echo ""
    
    local found
    found=$(jq -r '
        [ .phases[] | .tasks[] | select(.status == "pending") ] |
        sort_by(if .priority == "P0" then 0 elif .priority == "P1" then 1 else 2 end) |
        .[0] //
        if . == null then
            {id: "NONE", title: "All tasks completed or in progress"}
        else
            .
        end
    ' "$STATE_FILE")
    
    local task_id
    task_id=$(echo "$found" | jq -r '.id')
    
    if [ "$task_id" = "NONE" ]; then
        echo "No pending tasks found. Check 'ready-tasks' for available work."
        return
    fi
    
    local deps_ok
    deps_ok=$(are_deps_completed "$task_id")
    
    echo "ID:       $task_id"
    echo "Title:    $(echo "$found" | jq -r '.title')"
    echo "Priority: $(echo "$found" | jq -r '.priority')"
    echo "Size:     $(echo "$found" | jq -r '.size')"
    echo "Phase:    $(jq -r --arg id "$task_id" '.phases[] | select(.tasks[]?.id == $id) | .id' "$STATE_FILE")"
    echo "Depends:  $(echo "$found" | jq -r '.depends_on | if length == 0 then "none" else join(", ") end')"
    echo "Ready:    $deps_ok"
    echo ""
    
    if [ "$deps_ok" = "yes" ]; then
        echo ">>> This task is READY to start. Run: ./cascade-cli.sh start-task $task_id"
    else
        local blocked
        blocked=$(get_blocked_by "$task_id")
        echo ">>> BLOCKED by: $blocked"
        echo ""
        echo "Looking for other ready tasks..."
        cmd_ready_tasks
    fi
}

cmd_ready_tasks() {
    echo "=== READY TASKS (all deps completed, status=pending) ==="
    echo ""
    
    jq -r '
        [.phases[] | . as $phase | .tasks[] | select(.status == "pending") | . + {phase_id: $phase.id}] |
        .[] |
        . as $task |
        {id, title, priority, size, phase_id, depends_on: (.depends_on // [])} |
        . + {deps_ok: (if (.depends_on | length) == 0 then true
            else (.depends_on | all(
                . as $dep | $task.depends_on | index($dep) | . == null | not
            )) end
            )}
        )
    ' "$STATE_FILE" 2>/dev/null || true
    
    # Simpler approach: list pending tasks with their dep statuses
    jq -r '
        .phases[] | . as $phase |
        .tasks[] | select(.status == "pending") |
        "\(.id)|\(.priority)|\(.size)|\(.depends_on | if length == 0 then "none" else join(",") end)|\($phase.id)|\(.title)"
    ' "$STATE_FILE" | while IFS='|' read -r id pri size deps phase title; do
        local ready="yes"
        if [ "$deps" != "none" ]; then
            IFS=',' read -ra dep_arr <<< "$deps"
            for dep in "${dep_arr[@]}"; do
                dep=$(echo "$dep" | xargs)
                local dep_status
                dep_status=$(get_task_status "$dep")
                if [ "$dep_status" != "completed" ]; then
                    ready="no"
                    break
                fi
            done
        fi
        
        if [ "$ready" = "yes" ]; then
            printf "  %-6s %-3s %-2s [%-2s] %s\n" "$id" "$pri" "$size" "$phase" "$title"
        fi
    done
    
    echo ""
    echo "--- BLOCKED tasks (deps not completed) ---"
    jq -r '
        .phases[] | . as $phase |
        .tasks[] | select(.status == "pending") |
        "\(.id)|\(.priority)|\(.depends_on | if length == 0 then "none" else join(",") end)|\(.title)"
    ' "$STATE_FILE" | while IFS='|' read -r id pri deps title; do
        local ready="yes"
        local blocked_by=""
        if [ "$deps" != "none" ]; then
            IFS=',' read -ra dep_arr <<< "$deps"
            for dep in "${dep_arr[@]}"; do
                dep=$(echo "$dep" | xargs)
                local dep_status
                dep_status=$(get_task_status "$dep")
                if [ "$dep_status" != "completed" ]; then
                    ready="no"
                    blocked_by="$blocked_by $dep($dep_status)"
                fi
            done
        fi
        
        if [ "$ready" = "no" ]; then
            printf "  %-6s blocked by:%s | %s\n" "$id" "$blocked_by" "$title"
        fi
    done
}

cmd_start_task() {
    local task_id="${1:?Usage: cascade-cli.sh start-task TASK_ID}"
    local current_status
    current_status=$(get_task_status "$task_id")
    
    if [ "$current_status" = "not_found" ]; then
        echo "ERROR: Task $task_id not found in cascade-state.json"
        exit 1
    fi
    
    if [ "$current_status" = "completed" ]; then
        echo "ERROR: Task $task_id is already completed"
        exit 1
    fi
    
    if [ "$current_status" = "in_progress" ]; then
        echo "WARN: Task $task_id is already in_progress"
        return
    fi
    
    local deps_ok
    deps_ok=$(are_deps_completed "$task_id")
    if [ "$deps_ok" != "yes" ]; then
        local blocked
        blocked=$(get_blocked_by "$task_id")
        echo "ERROR: Task $task_id is BLOCKED by: $blocked"
        echo "Complete the blocking tasks first."
        exit 1
    fi
    
    # Update status
    local tmp
    tmp=$(mktemp)
    jq --arg id "$task_id" '
        .phases[].tasks |= map(
            if .id == $id then .status = "in_progress" else . end
        )
    ' "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
    
    echo "OK: Task $task_id marked as in_progress"
    echo "Title: $(get_task_field "$task_id" 'title')"
    echo ""
    echo "Acceptance criteria:"
    get_task_field "$task_id" 'acceptance' | sed 's/^/  /'
    echo ""
    echo "Anti-hallucination checks:"
    get_task_field "$task_id" 'anti_hallucination' | sed 's/^/  /'
}

cmd_complete_task() {
    local task_id="${1:?Usage: cascade-cli.sh complete-task TASK_ID}"
    local current_status
    current_status=$(get_task_status "$task_id")
    
    if [ "$current_status" = "not_found" ]; then
        echo "ERROR: Task $task_id not found in cascade-state.json"
        exit 1
    fi
    
    if [ "$current_status" != "in_progress" ]; then
        echo "ERROR: Task $task_id is $current_status. Only in_progress tasks can be completed."
        echo "Run: ./cascade-cli.sh start-task $task_id first"
        exit 1
    fi
    
    # Show acceptance criteria for manual verification
    echo "=== VERIFICATION CHECKLIST for $task_id ==="
    echo ""
    echo "Acceptance criteria:"
    get_task_field "$task_id" 'acceptance' | sed 's/^/  [ ] /'
    echo ""
    echo "Anti-hallucination checks:"
    get_task_field "$task_id" 'anti_hallucination' | sed 's/^/  [ ] /'
    echo ""
    echo "Have ALL criteria been verified? (y/N)"
    read -r confirm
    
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo "ABORTED: Task $task_id NOT marked as completed."
        exit 0
    fi
    
    # Update status
    local tmp
    tmp=$(mktemp)
    jq --arg id "$task_id" '
        .phases[].tasks |= map(
            if .id == $id then .status = "completed" else . end
        ) |
        ._meta.lastUpdated = (now | todate)
    ' "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
    
    echo "OK: Task $task_id marked as COMPLETED"
    echo ""
    
    # Show what's now unblocked
    echo "Tasks now unblocked:"
    jq -r --arg id "$task_id" '
        [.phases[].tasks[] | select(.status == "pending") | select(.depends_on // [] | contains([$id]))] |
        if length == 0 then "  (none)" else .[] | "  \(.id) — \(.title)" end
    ' "$STATE_FILE"
}

cmd_block_task() {
    local task_id="${1:?Usage: cascade-cli.sh block-task TASK_ID REASON}"
    local reason="${2:-No reason provided}"
    local tmp
    tmp=$(mktemp)
    jq --arg id "$task_id" --arg reason "$reason" '
        .phases[].tasks |= map(
            if .id == $id then .status = "blocked" else . end
        )
    ' "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
    echo "OK: Task $task_id marked as BLOCKED. Reason: $reason"
}

cmd_status() {
    echo "============================================="
    echo "  CASCADE-GUARD - STATUS"
    echo "============================================="
    echo ""
    
    jq -r '
        .phases[] |
        {id, name, total: (.tasks | length), completed: ([.tasks[] | select(.status == "completed")] | length), in_progress: ([.tasks[] | select(.status == "in_progress")] | length), blocked: ([.tasks[] | select(.status == "blocked")] | length), pending: ([.tasks[] | select(.status == "pending")] | length)} |
        "\(.id) \(.name)\n  Total: \(.total) | Done: \(.completed) | In Progress: \(.in_progress) | Blocked: \(.blocked) | Pending: \(.pending)\n"
    ' "$STATE_FILE"
    
    echo "-------------------------------------------"
    local total completed
    total=$(jq '[.phases[].tasks] | flatten | length' "$STATE_FILE")
    completed=$(jq '[.phases[].tasks[] | select(.status == "completed")] | length' "$STATE_FILE")
    echo "TOTAL: $completed / $total tasks completed ($(( completed * 100 / total ))%)"
    echo ""
    
    # Show in_progress tasks
    echo "=== IN PROGRESS ==="
    jq -r '.phases[].tasks[] | select(.status == "in_progress") | "  \(.id) — \(.title)"' "$STATE_FILE"
    echo ""
    
    # Show blocked tasks
    echo "=== BLOCKED ==="
    jq -r '.phases[].tasks[] | select(.status == "blocked") | "  \(.id) — \(.title)"' "$STATE_FILE"
    echo ""
    
    # Show next ready task
    echo "=== NEXT TASK ==="
    cmd_next_task
}

cmd_deps() {
    local task_id="${1:?Usage: cascade-cli.sh deps TASK_ID}"
    echo "=== Dependencies for $task_id ==="
    echo ""
    
    echo "Direct depends_on:"
    jq -r --arg id "$task_id" '
        [.phases[].tasks[] | select(.id == $id)][0].depends_on[]? //
        "  (no dependencies)"
    ' "$STATE_FILE" | while read -r dep; do
        local dep_status
        dep_status=$(get_task_status "$dep")
        printf "  %-6s [%s]\n" "$dep" "$dep_status"
    done
    
    echo ""
    echo "Tasks that depend on this task:"
    jq -r --arg id "$task_id" '
        [.phases[].tasks[] | select((.depends_on // []) | contains([$id]))] |
        if length == 0 then "  (none)" else .[] | "  \(.id) — \(.title) [\(.status)]" end
    ' "$STATE_FILE"
}

cmd_implements() {
    local task_id="${1:?Usage: cascade-cli.sh implements TASK_ID}"
    echo "=== Function mapping for $task_id ==="
    echo ""
    
    echo "This task implements functions:"
    local impl
    impl=$(jq -r --arg id "$task_id" '
        [.phases[].tasks[] | select(.id == $id)][0].implements[]?
    ' "$STATE_FILE")
    
    if [ -z "$impl" ]; then
        echo "  (no function mapping)"
    else
        echo "$impl" | while read -r func_id; do
            local func_name
            func_name=$(jq -r --arg fid "$func_id" '
                [.functionInventory[] | select(.id == $fid)][0].name // "unknown"
            ' "$STATE_FILE")
            printf "  %-10s %s\n" "$func_id" "$func_name"
        done
    fi
}

cmd_validate() {
    echo "=== Validating cascade-state.json ==="
    echo ""
    local errors=0
    
    # Check all depends_on references exist
    jq -r '
        .phases[].tasks[] | .id as $task_id | .depends_on[]? |
        {task: $task_id, dep: .} |
        "\(.task)|\(.dep)"
    ' "$STATE_FILE" | while IFS='|' read -r task_id dep_id; do
        local dep_exists
        dep_exists=$(jq --arg dep "$dep_id" '[.phases[].tasks[] | select(.id == $dep)] | length' "$STATE_FILE")
        if [ "$dep_exists" = "0" ]; then
            echo "ERROR: $task_id depends on $dep_id which does not exist"
            errors=$((errors + 1))
        fi
    done
    
    # Check all implements references exist
    jq -r '
        .phases[].tasks[] | .id as $task_id | .implements[]? |
        {task: $task_id, func: .} |
        "\(.task)|\(.func)"
    ' "$STATE_FILE" | while IFS='|' read -r task_id func_id; do
        local func_exists
        func_exists=$(jq --arg fid "$func_id" '[.functionInventory[] | select(.id == $fid)] | length' "$STATE_FILE")
        if [ "$func_exists" = "0" ]; then
            echo "ERROR: $task_id implements $func_id which does not exist in functionInventory"
            errors=$((errors + 1))
        fi
    done
    
    # Check for circular dependencies
    echo "Circular dependency check:"
    # Simple check: for each task, verify no dep chain leads back to itself
    jq -r '.phases[].tasks[].id' "$STATE_FILE" | while read -r task_id; do
        local deps
        deps=$(jq -r --arg id "$task_id" '
            [.phases[].tasks[] | select(.id == $id)][0].depends_on[]?
        ' "$STATE_FILE")
        if [ -n "$deps" ]; then
            echo "$deps" | while read -r dep; do
                # Check if dep depends on task_id (direct circular)
                local reverse_dep
                reverse_dep=$(jq -r --arg did "$dep" '
                    [.phases[].tasks[] | select(.id == $did)][0].depends_on[]?
                ' "$STATE_FILE")
                if echo "$reverse_dep" | grep -q "^${task_id}$"; then
                    echo "  ERROR: Circular dependency between $task_id and $dep"
                fi
            done
        fi
    done
    
    echo ""
    echo "Validation complete."
}

# ---- Main ----

case "${1:-help}" in
    next-task)      cmd_next_task ;;
    ready-tasks)    cmd_ready_tasks ;;
    start-task)     cmd_start_task "${2:-}" ;;
    complete-task)  cmd_complete_task "${2:-}" ;;
    block-task)     cmd_block_task "${2:-}" "${3:-}" ;;
    status)         cmd_status ;;
    deps)           cmd_deps "${2:-}" ;;
    implements)     cmd_implements "${2:-}" ;;
    validate)       cmd_validate ;;
    help|*)
        echo "Cascade-guard CLI"
        echo ""
        echo "Commands:"
        echo "  next-task              Show the next ready task"
        echo "  ready-tasks            List all ready tasks"
        echo "  start-task ID          Mark task as in_progress"
        echo "  complete-task ID       Mark task as completed (with verification)"
        echo "  block-task ID REASON   Mark task as blocked"
        echo "  status                 Show cascade overview"
        echo "  deps ID                Show task dependencies"
        echo "  implements ID          Show function mapping"
        echo "  validate               Validate cascade-state.json"
        ;;
esac
