"use client";

import { useEffect } from "react";
import { TaskList, TaskCreateForm, useTaskStore } from "@/features/tasks";
import { useLanguage } from "@/lib/i18n/language-context";

export default function TasksPage() {
  const { fetchTasks } = useTaskStore();
  const { t } = useLanguage();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t.pages['Tasks']}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t.pages['Manage tasks for your agents']}
        </p>
      </div>

      <TaskCreateForm />
      <TaskList />
    </div>
  );
}
