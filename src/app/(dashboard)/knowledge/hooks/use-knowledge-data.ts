import { useEffect, useState, useCallback } from 'react';
import type { KnowledgeCollection, KnowledgeDocument } from '@/features/knowledge/types';

export function useKnowledgeData() {
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [collectionName, setCollectionName] = useState('');
  const [loading, setLoading] = useState(true);

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

  const createCollection = useCallback(async (data: { name: string; description: string }) => {
    try {
      const res = await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      fetchCollections();
    } catch { /* silent */ }
  }, [fetchCollections]);

  const deleteCollection = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setSelectedId(prev => prev === id ? null : prev);
      fetchCollections();
    } catch { /* silent */ }
  }, [fetchCollections]);

  const deleteDocument = useCallback(async (docId: string) => {
    if (!selectedId) return;
    try {
      const res = await fetch(`/api/knowledge/${selectedId}/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchDocuments(selectedId);
    } catch { /* silent */ }
  }, [selectedId, fetchDocuments]);

  const uploadDocument = useCallback(async (collectionId: string, file: File) => {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', file.name);
      const res = await fetch(`/api/knowledge/${collectionId}/documents`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      if (collectionId === selectedId) fetchDocuments(selectedId);
    } catch { /* silent */ }
  }, [selectedId, fetchDocuments]);

  return {
    collections, selectedId, documents, collectionName, loading,
    setSelectedId, createCollection, deleteCollection, deleteDocument, uploadDocument,
  };
}