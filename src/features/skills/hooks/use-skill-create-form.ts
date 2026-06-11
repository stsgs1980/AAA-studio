import { useState, useCallback } from "react";
import { useSkillStore } from "../store/skills-store";

const CATEGORIES = ["general", "code", "data", "security", "communication", "analysis"] as const;
const COMPATS = ["both", "sandbox", "local"] as const;
const LICENSES = ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "ISC", "Unlicense"] as const;

export { CATEGORIES, COMPATS, LICENSES };

export function useSkillCreateForm() {
  const { createSkill, setShowNew } = useSkillStore();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [description, setDescription] = useState("");
  const [compatibility, setCompatibility] = useState("both");
  const [license, setLicense] = useState("MIT");
  const [author, setAuthor] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [triggersStr, setTriggersStr] = useState("");
  const [expanded, setExpanded] = useState(false);

  const reset = useCallback(() => {
    setName("");
    setCategory("general");
    setDescription("");
    setCompatibility("both");
    setLicense("MIT");
    setAuthor("");
    setTagsStr("");
    setTriggersStr("");
    setExpanded(false);
  }, []);

  const submit = useCallback(() => {
    if (!name.trim()) return;
    createSkill(name.trim(), {
      category,
      description,
      compatibility,
      license,
      author,
      tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
      triggers: triggersStr ? triggersStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
    reset();
  }, [name, category, description, compatibility, license, author, tagsStr, triggersStr, createSkill, reset]);

  const cancel = useCallback(() => {
    reset();
    setShowNew(false);
  }, [reset, setShowNew]);

  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  return {
    fields: { name, category, description, compatibility, license, author, tagsStr, triggersStr, expanded },
    setters: { setName, setCategory, setDescription, setCompatibility, setLicense, setAuthor, setTagsStr, setTriggersStr },
    actions: { submit, cancel, toggleExpanded },
    canSubmit: name.trim().length > 0,
  };
}