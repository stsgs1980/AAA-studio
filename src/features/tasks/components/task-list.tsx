"use client";

import { useTaskStore } from "../hooks/use-task-store";
import { TASK_STATUSES, STATUS_COLORS, PRIORITY_COLORS } from "../types";
import type { Task } from "../types";

export function TaskList() {
  const { tasks, counts, loading, filter, setFilter, deleteTask, updateTask } = useTaskStore();

  if (loading && tasks.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No tasks yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status filter bar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter({ status: undefined })}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            !filter.status ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({Object.values(counts).reduce((a, b) => a + b, 0)})
        </button>
        {TASK_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter({ status: filter.status === s ? undefined : s })}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
              filter.status === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
            {s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* Task cards */}
      <div className="space-y-2">
        {tasks.map((task: Task) => (
          <div
            key={task.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors group"
          >
            {/* Status dot */}
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`} />

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{task.title}</p>
              {task.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {task.description}
                </p>
              )}
            </div>

            {/* Agent badge */}
            {task.agent && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded flex-shrink-0">
                {task.agent.name}
              </span>
            )}

            {/* Priority */}
            <span className={`text-xs font-medium flex-shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              {task.status === 'pending' && (
                <button
                  onClick={() => updateTask(task.id, { status: 'running' })}
                  className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded hover:bg-blue-500/20"
                >
                  Start
                </button>
              )}
              {task.status === 'running' && (
                <button
                  onClick={() => updateTask(task.id, { status: 'completed' })}
                  className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded hover:bg-green-500/20"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="text-xs text-red-400 hover:text-red-300 px-1"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
