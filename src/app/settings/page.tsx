'use client';

import { useEffect, useState, useCallback } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';
import { cn } from '@stsgs/ui';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/settings');
    setSettings(await res.json());
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = useCallback(async () => {
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const handleReset = useCallback(async () => {
    if (!confirm('Reset all settings to defaults?')) return;
    const defaults: Record<string, string> = { theme: 'dark', language: 'en', llm_model: 'gpt-4', max_tokens: '4096', temperature: '0.7' };
    await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(defaults) });
    setSettings(defaults);
  }, []);

  const update = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  const sections = [
    { title: 'Appearance', keys: [
      { key: 'theme', label: 'Theme', type: 'select', options: ['dark', 'light', 'system'] },
      { key: 'language', label: 'Language', type: 'select', options: ['en', 'ru', 'zh'] },
    ]},
    { title: 'LLM Defaults', keys: [
      { key: 'llm_model', label: 'Default Model', type: 'select', options: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'llama-3'] },
      { key: 'max_tokens', label: 'Max Tokens', type: 'number' },
      { key: 'temperature', label: 'Temperature', type: 'range', min: 0, max: 2, step: 0.1 },
    ]},
    { title: 'Editor', keys: [
      { key: 'auto_save', label: 'Auto-save (ms)', type: 'number' },
      { key: 'snap_to_grid', label: 'Snap to Grid', type: 'select', options: ['true', 'false'] },
    ]},
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm hover:bg-accent"><RotateCcw className="h-4 w-4" /> Reset</button>
          <button onClick={handleSave} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90', saved && 'bg-emerald-600')}>
            <Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="rounded-xl border bg-card shadow-sm p-4">
            <h2 className="text-sm font-semibold mb-4">{section.title}</h2>
            <div className="space-y-4">
              {section.keys.map(({ key, label, type, options, min, max, step }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <label className="text-sm shrink-0">{label}</label>
                  {type === 'select' ? (
                    <select value={settings[key] ?? ''} onChange={(e) => update(key, e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-48">
                      {(options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : type === 'range' ? (
                    <div className="flex items-center gap-2 w-48">
                      <input type="range" min={min} max={max} step={step} value={settings[key] ?? '0'} onChange={(e) => update(key, e.target.value)} className="flex-1" />
                      <span className="text-sm tabular-nums w-8 text-right">{settings[key]}</span>
                    </div>
                  ) : (
                    <input type={type} value={settings[key] ?? ''} onChange={(e) => update(key, e.target.value)} className="h-9 px-3 rounded-md border bg-background text-sm w-48" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
