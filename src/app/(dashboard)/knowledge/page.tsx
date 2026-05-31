'use client';

import { useEffect, useState, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { PageSkeleton } from '@/components/ui';
import { CollectionForm, CollectionList, DocumentList, SearchBar } from '@/features/knowledge/components';
import type { KnowledgeCollection, KnowledgeDocument } from '@/features/knowledge/types';
import { useLanguage } from '@/lib/i18n/language-context';

export default function KnowledgeBasePage() {
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [collectionName, setCollectionName] = useState('');
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/knowledge');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCollections(data.map((c: KnowledgeCollection & { tags: string }) => ({ ...c, tags: JSON.parse(c.tags) })));
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const fetchDocuments = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/knowledge/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDocuments(data.documents ?? []);
      setCollectionName(data.name);
    } catch { setDocuments([]); }
  }, []);

  useEffect(() => {
    if (selectedId) fetchDocuments(selectedId);
    else { setDocuments([]); setCollectionName(''); }
  }, [selectedId, fetchDocuments]);

  const handleCreate = useCallback(async (data: { name: string; description: string }) => {
    try {
      const res = await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      fetchCollections();
    } catch { /* silent */ }
  }, [fetchCollections]);

  const handleDeleteCollection = useCallback(async (id: string) => {
    if (!confirm(t.pages['Delete this collection and all its documents?'])) return;
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      if (selectedId === id) setSelectedId(null);
      fetchCollections();
    } catch { /* silent */ }
  }, [selectedId, fetchCollections, t]);

  const handleDeleteDoc = useCallback(async (docId: string) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/knowledge/${selectedId}/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchDocuments(selectedId);
    } catch { /* silent */ }
  }, [selectedId, fetchDocuments]);

  const handleUpload = useCallback(async (collectionId: string, file: File) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', file.name);
      const res = await fetch(`/api/knowledge/${collectionId}/documents`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      if (collectionId === selectedId) fetchDocuments(selectedId);
    } catch { /* silent */ }
  }, [selectedId, fetchDocuments]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">{t.pages['Knowledge Base']}</h1>
        </div>
        <CollectionForm onCreate={handleCreate} />
      </div>

      <SearchBar collectionId={selectedId} />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          <div className="rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={4} /></div>
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={3} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">{t.pages['Collections']} ({collections.length})</h2>
            </div>
            <div className="overflow-y-auto max-h-[55vh]">
              <CollectionList collections={collections} selectedId={selectedId} onSelect={setSelectedId} onDelete={handleDeleteCollection} />
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">{collectionName || t.pages['Select a collection']}</h2>
            </div>
            <div className="p-4 overflow-y-auto max-h-[55vh]">
              {selectedId ? (
                <DocumentList documents={documents} collectionId={selectedId} onDelete={handleDeleteDoc} onUpload={handleUpload} />
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">{t.pages['Select a collection to view documents']}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
