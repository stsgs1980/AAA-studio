"use client";

import { useState, type FormEvent } from "react";
import { useWorkflowStore } from "./use-workflow-store";

export function useWorkflowCreateForm() {
  const { createWorkflow } = useWorkflowStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState("manual");
  const [open, setOpen] = useState(false);

  const fields = { name, description, triggerType, open } as const;
  const setters = { setName, setDescription, setTriggerType, setOpen } as const;
  const canSubmit = name.trim().length > 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    await createWorkflow({ name: name.trim(), description: description.trim(), triggerType });
    setName("");
    setDescription("");
    setTriggerType("manual");
    setOpen(false);
  };

  const toggleOpen = () => setOpen((v) => !v);

  return { fields, setters, actions: { submit, toggleOpen }, canSubmit };
}