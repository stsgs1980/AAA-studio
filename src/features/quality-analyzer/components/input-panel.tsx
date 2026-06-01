"use client";

import { Link2, Bot, FileText, Upload } from "lucide-react";
import { cn } from "@stsgs/ui";
import { useQualityStore } from "../hooks/use-quality-store";
import type { InputMode } from "../types";
import { FileUploader } from "./file-uploader";

const MODES: { key: InputMode; icon: typeof FileText; label: string }[] = [
  { key: "text", icon: FileText, label: "Paste Text" },
  { key: "file", icon: Upload, label: "Upload File" },
  { key: "url", icon: Link2, label: "From URL" },
  { key: "agent", icon: Bot, label: "From Agent" },
];

export function InputPanel() {
  const { input, setInputMode, setText, setSourceUrl, setAgentId } =
    useQualityStore();

  return (
    <div className="flex flex-col gap-3">
      {/* Mode selector */}
      <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
        {MODES.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setInputMode(key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
              input.mode === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Text mode */}
      {input.mode === "text" && (
        <textarea
          value={input.text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste system prompt, agent config, or any text to evaluate..."
          className="min-h-[280px] w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary"
        />
      )}

      {/* File mode */}
      {input.mode === "file" && <FileUploader />}

      {/* URL mode */}
      {input.mode === "url" && (
        <div className="flex flex-col gap-2">
          <input
            value={input.sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://github.com/user/repo/blob/main/system_prompt.md"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="text-xs text-muted-foreground">
            Paste a GitHub raw URL or any public file URL. The system will fetch
            the content for evaluation.
          </p>
          {input.text && (
            <textarea
              value={input.text}
              readOnly
              className="min-h-[200px] w-full resize-none rounded-lg border bg-muted/30 px-3 py-2 text-xs font-mono"
            />
          )}
        </div>
      )}

      {/* Agent mode */}
      {input.mode === "agent" && (
        <div className="flex flex-col gap-2">
          <select
            value={input.agentId}
            onChange={(e) => setAgentId(e.target.value)}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Select an agent...</option>
          </select>
          {input.text && (
            <textarea
              value={input.text}
              readOnly
              className="min-h-[200px] w-full resize-none rounded-lg border bg-muted/30 px-3 py-2 text-xs font-mono"
            />
          )}
        </div>
      )}
    </div>
  );
}
