'use client';

import { useEffect, useState, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import { CollectionForm, CollectionList, DocumentList } from '@/features/knowledge/components';
import type { KnowledgeCollection, KnowledgeDocument } from '@/features/knowledge/types';

export default function KnowledgeBasePage() {
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [collectionName, setCollectionName] = useState('');

  const fetchCollections = useCallback(async () => {
    const res = await fetch('/api/knowledge');
    const data = await res.json();
    setCollections(data.map((c: KnowledgeCollection & { tags: string }) => ({ ...c, tags: JSON.parse(c.tags) })));
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const fetchDocuments = useCallback(async (id: string) => {
    const res = await fetch(`/api/knowledge/${id}`);
    const data = await res.json();
    setDocuments(data.documents ?? []);
    setCollectionName(data.name);
  }, []);

  useEffect(() => {
    if (selectedId) fetchDocuments(selectedId);
    else { setDocuments([]); setCollectionName(''); }
  }, [selectedId, fetchDocuments]);

  const handleCreate = useCallback(async (data: { name: string; description: string }) => {
    await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    fetchCollections();
  }, [fetchCollections]);

  const handleDeleteCollection = useCallback(async (id: string) => {
    if (!confirm('Delete this collection and all its documents?')) return;
    await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
    if (selectedId === id) setSelectedId(null);
    fetchCollections();
  }, [selectedId, fetchCollections]);

  const handleDeleteDoc = useCallback(async (docId: string) => {
    if (!selectedId) return;
    await fetch(`/api/knowledge/${selectedId}/documents/${docId}`, { method: 'DELETE' });
    fetchDocuments(selectedId);
  }, [selectedId, fetchDocuments]);

  const handleUpload = useCallback(async (collectionId: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name);
    await fetch(`/api/knowledge/${collectionId}/documents`, { method: 'POST', body: fd });
    if (collectionId === selectedId) fetchDocuments(selectedId);
  }, [selectedId, fetchDocuments]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        </div>
        <CollectionForm onCreate={handleCreate} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[60vh]">
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/30">
            <h2 className="text-sm font-semibold">Collections ({collections.length})</h2>
          </div>
          <div className="overflow-y-auto max-h-[55vh]">
            <CollectionList collections={collections} selectedId={selectedId} onSelect={setSelectedId} onDelete={handleDeleteCollection} />
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b bg-muted/30">
            <h2 className="text-sm font-semibold">{collectionName || 'Select a collection'}</h2>
          </div>
          <div className="p-4 overflow-y-auto max-h-[55vh]">
            {selectedId ? (
              <DocumentList documents={documents} collectionId={selectedId} onDelete={handleDeleteDoc} onUpload={handleUpload} />
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Select a collection to view documents</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
