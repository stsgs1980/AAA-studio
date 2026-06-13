#!/usr/bin/env bash
#
# cascade-cli.sh - CLI tool for AI agents to navigate the task cascade
#
# Usage:
#   ./cascade-cli.sh next-task          -- Show the next ready task to work on
#   ./cascade-cli.sh ready-tasks        -- List all tasks ready to start
#   ./cascade-cli.sh complete-task ID   -- Mark a task as completed
#   ./cascade-cli.sh start-task ID      -- Mark a task as in_progress
#   ./cascade-cli.sh block-task ID REASON -- Mark a task as blocked with reason
#   ./cascade-cli.sh status             -- Show overall cascade status
#   ./cascade-cli.sh deps ID            -- Show dependencies for a task
#   ./cascade-cli.sh implements ID      -- Show which functions a task implements
#   ./cascade-cli.sh validate           -- Validate cascade-state.json integrity
#
# This is the thin orchestrator. Helpers are in cascade-cli-lib.sh,
# command implementations are in cascade-cli-commands/ directory.

set -euo pipefail

CLI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source shared helpers
source "$CLI_DIR/cascade-cli-lib.sh"

# Source all command implementations
source "$CLI_DIR/cascade-cli-commands/cmd-next-task.sh"
source "$CLI_DIR/cascade-cli-commands/cmd-ready-tasks.sh"
source "$CLI_DIR/cascade-cli-commands/cmd-start-task.sh"
source "$CLI_DIR/cascade-cli-commands/cmd-complete-task.sh"
source "$CLI_DIR/cascade-cli-commands/cmd-block-task.sh"
source "$CLI_DIR/cascade-cli-commands/cmd-status.sh"
source "$CLI_DIR/cascade-cli-commands/cmd-deps.sh"
source "$CLI_DIR/cascade-cli-commands/cmd-implements.sh"
source "$CLI_DIR/cascade-cli-commands/cmd-validate.sh"

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