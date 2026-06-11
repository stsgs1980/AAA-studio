"use client";

import { useState, type FormEvent } from "react";
import { useTaskStore } from "./use-task-store";

export function useTaskCreateForm() {
  const { createTask } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [open, setOpen] = useState(false);

  const fields = { title, description, priority, open } as const;
  const setters = { setTitle, setDescription, setPriority, setOpen } as const;
  const canSubmit = title.trim().length > 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await createTask({ title: title.trim(), description: description.trim(), priority });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setOpen(false);
  };

  const toggleOpen = () => setOpen((v) => !v);

  return { fields, setters, actions: { submit, toggleOpen }, canSubmit };
}