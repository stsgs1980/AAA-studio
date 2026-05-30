"use client";

import { useEffect } from "react";
import { TaskList, TaskCreateForm, useTaskStore } from "@/features/tasks";

export default function TasksPage() {
  const { fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage tasks for your agents
        </p>
      </div>

      <TaskCreateForm />
      <TaskList />
    </div>
  );
}
