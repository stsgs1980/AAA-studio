'use client';
import { Plus } from 'lucide-react';
import type { ProviderConfig } from '@/lib/llm';
import { LLM_PROVIDERS } from '@/lib/llm';
import type { LLMProviderId } from '@/lib/llm';
import { useLanguage } from '@/lib/i18n/language-context';

export function AddMenu({ providers, open, setOpen, addBuiltin, addCustom }: {
  providers: ProviderConfig[];
  open: boolean;
  setOpen: (v: boolean) => void;
  addBuiltin: (id: LLMProviderId) => void;
  addCustom: () => void;
}) {
  const existingIds = new Set(providers.map(p => p.id));
  const available = (Object.keys(LLM_PROVIDERS) as LLMProviderId[]).filter(id => !existingIds.has(id));
  const hasAvailable = available.length > 0;
  const { t } = useLanguage();

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="h-8 px-3 rounded-md border text-sm font-medium hover:bg-accent flex items-center gap-1.5">
        <Plus className="h-3.5 w-3.5" /> {t.settings['Add Provider']}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border bg-popover shadow-lg py-1">
          {hasAvailable ? available.map(id => (
            <button key={id} onClick={() => addBuiltin(id)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent flex items-center gap-2">
              {LLM_PROVIDERS[id].name}
            </button>
          )) : (
            <div className="px-3 py-2 text-xs text-muted-foreground">{t.settings['All built-in providers added']}</div>
          )}
          <div className="border-t my-1" />
          <button onClick={addCustom}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent flex items-center gap-2 text-muted-foreground">
            <Plus className="h-3 w-3" /> {t.settings['Custom Provider...']}
          </button>
        </div>
      )}
    </div>
  );
}
