'use client';

import { BookOpen } from 'lucide-react';
import { PageSkeleton } from '@/components/ui';
import { CollectionForm, CollectionList, DocumentList, SearchBar } from '@/features/knowledge/components';
import { useLanguage } from '@/lib/i18n/language-context';
import { useKnowledgeData } from './hooks/use-knowledge-data';

export default function KnowledgeBasePage() {
  const {
    collections, selectedId, documents, collectionName, loading,
    setSelectedId, createCollection, deleteCollection, deleteDocument, uploadDocument,
  } = useKnowledgeData();
  const { t } = useLanguage();

  const handleDeleteCollection = (id: string) => {
    if (!confirm(t.pages['Delete this collection and all its documents?'])) return;
    deleteCollection(id);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold tracking-tight">{t.pages['Knowledge Base']}</h1>
        </div>
        <CollectionForm onCreate={createCollection} />
      </div>

      <SearchBar collectionId={selectedId} />

      {loading ? (
        <div className="flex flex-col lg:flex-row gap-4 min-h-[60vh]">
          <div className="w-full lg:w-56 shrink-0 rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={4} /></div>
          <div className="flex-1 min-w-0 rounded-xl border bg-card shadow-sm p-4"><PageSkeleton rows={3} /></div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 min-h-[60vh]">
          <div className="w-full lg:w-56 shrink-0 rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">{t.pages['Collections']} ({collections.length})</h2>
            </div>
            <div className="overflow-y-auto max-h-[55vh]">
              <CollectionList collections={collections} selectedId={selectedId} onSelect={setSelectedId} onDelete={handleDeleteCollection} />
            </div>
          </div>

          <div className="flex-1 min-w-0 rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-2 border-b bg-muted/30">
              <h2 className="text-sm font-semibold">{collectionName || t.pages['Select a collection']}</h2>
            </div>
            <div className="p-4 overflow-y-auto max-h-[55vh]">
              {selectedId ? (
                <DocumentList documents={documents} collectionId={selectedId} onDelete={deleteDocument} onUpload={uploadDocument} />
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