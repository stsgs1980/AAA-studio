"use client";

import { Cpu } from "lucide-react";
import { cn } from "@stsgs/ui";
import { useCreatorStore } from "@/features/agent-creator";
import {
  StepAgentType,
  StepConfigure,
  StepPrompt,
  StepTools,
  StepPreview,
} from "@/features/agent-creator";
import { useLanguage } from "@/lib/i18n/language-context";

const STEP_KEYS = ["agent-type", "configure", "prompt", "tools", "preview"] as const;

const STEP_COMPONENTS = [
  StepAgentType,
  StepConfigure,
  StepPrompt,
  StepTools,
  StepPreview,
] as const;

export default function AgentCreatorPage() {
  const { step, next, prev, done } = useCreatorStore();
  const { t } = useLanguage();
  const StepComponent = STEP_COMPONENTS[step];

  const stepLabels = [t.common['Type'], t.pages['Configure'], t.pages['Prompt'], t.pages['Tools'], t.pages['Preview']];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Cpu className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t.pages['Agent Creator']}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t.pages['Build an AI agent step-by-step with guided prompts and live quality scoring.']}
          </p>
        </div>
      </div>

      {/* Stepper */}
      {!done && (
        <div className="flex items-center gap-1">
          {STEP_KEYS.map((key, i) => (
            <div key={key} className="flex items-center">
              {i > 0 && (
                <div
                  className={cn(
                    "w-8 h-px",
                    i <= step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <button
                onClick={() => {
                  if (i < step) useCreatorStore.getState().setStep(i);
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors",
                  i === step
                    ? "bg-primary text-primary-foreground font-medium"
                    : i < step
                      ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                      : "bg-muted text-muted-foreground"
                )}
              >
                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-medium">
                  {i + 1}
                </span>
                <span className="hidden sm:inline">{stepLabels[i]}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      <div className="mt-4">
        <StepComponent />
      </div>

      {/* Navigation buttons */}
      {!done && step > 0 && step < STEP_KEYS.length - 1 && (
        <div className="flex gap-3 pt-2">
          <button
            onClick={prev}
            className="px-4 py-2 text-sm rounded-md border hover:bg-accent"
          >
            {t.common['Back']}
          </button>
          <button
            onClick={next}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t.common['Next']}
          </button>
        </div>
      )}
    </div>
  );
}
