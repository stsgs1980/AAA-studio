'use client';

import { useState, useRef } from 'react';
import { Upload, FileArchive, CheckCircle, AlertCircle, SkipForward } from 'lucide-react';

interface ImportResult { name: string; status: 'created' | 'skipped' | 'error'; reason?: string }
interface ImportSummary { created: number; skipped: number; errors: number }

export function AgentImportDialog({ onClose, onImported }: { onClose: () => void; onImported: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setResults(null); setSummary(null); setError(null); }
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/agents/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Import failed'); return; }
      setResults(data.data?.results || []);
      setSummary(data.data?.summary || null);
      onImported();
    } catch { setError('Network error during upload'); } finally { setUploading(false); }
  };

  const statusIcon = (s: string) => {
    if (s === 'created') return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    if (s === 'skipped') return <SkipForward className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    return <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center">
            <FileArchive className="w-4.5 h-4.5 text-brand-purple" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Import Agents</h3>
            <p className="text-[10px] text-muted-foreground">Upload a ZIP with agent JSON files</p>
          </div>
        </div>

        <div onClick={() => inputRef.current?.click()} className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-accent/30 transition-colors">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          {file ? (
            <p className="text-xs text-foreground font-medium">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
          ) : (
            <><p className="text-xs text-foreground font-medium">Click to select a .zip file</p>
            <p className="text-[10px] text-muted-foreground mt-1">Each JSON file should define an agent</p></>
          )}
          <input ref={inputRef} type="file" accept=".zip" onChange={handleFileChange} className="hidden" />
        </div>

        {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2"><p className="text-xs text-red-600 dark:text-red-400">{error}</p></div>}

        {results && summary && (
          <div className="space-y-2">
            <div className="flex gap-3 text-center">
              <SummaryBox value={summary.created} label="Created" color="emerald" />
              <SummaryBox value={summary.skipped} label="Skipped" color="amber" />
              <SummaryBox value={summary.errors} label="Errors" color="red" />
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {statusIcon(r.status)}
                  <span className="text-foreground font-medium truncate">{r.name}</span>
                  {r.reason && <span className="text-muted-foreground text-[10px] truncate">- {r.reason}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-accent transition-colors">
            {results ? 'Close' : 'Cancel'}
          </button>
          {!results && (
            <button onClick={handleUpload} disabled={!file || uploading}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-brand-purple/15 text-brand-purple border border-brand-purple/30 hover:bg-brand-purple/25 disabled:opacity-40 disabled:pointer-events-none transition-colors">
              {uploading ? 'Importing...' : 'Import'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryBox({ value, label, color }: { value: number; label: string; color: string }) {
  const cls = color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    : color === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
    : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400';
  return (
    <div className={`flex-1 rounded-lg border px-2 py-1.5 ${cls}`}>
      <p className="text-sm font-bold">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}
