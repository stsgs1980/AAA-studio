import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { buildSearchIndex, searchIndex } from "@/features/knowledge/lib/tf-idf";

/**
 * POST /api/knowledge/search
 * Body: { query: string, collectionId?: string, topK?: number }
 * Returns top-K documents by TF-IDF cosine similarity.
 */
export async function POST(request: Request) {
  try {
    const { query, collectionId, topK = 5 } = await request.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const where = collectionId ? { collectionId } : {};
    const documents = await db.knowledgeDocument.findMany({
      where,
      select: { id: true, content: true, title: true, fileType: true, collectionId: true },
      take: 500,
    });

    if (documents.length === 0) {
      return NextResponse.json({ results: [], query });
    }

    const index = buildSearchIndex(documents);
    const scored = searchIndex(query, index, topK);

    // Enrich results with document metadata
    const results = scored.map((s) => {
      const doc = documents.find((d) => d.id === s.docId);
      return {
        docId: s.docId,
        score: Math.round(s.score * 1000) / 1000,
        title: doc?.title ?? "",
        fileType: doc?.fileType ?? "txt",
        collectionId: doc?.collectionId ?? "",
        snippet: doc?.content?.slice(0, 200) ?? "",
      };
    });

    return NextResponse.json({ results, query });
  } catch (error) {
    console.error("[POST /api/knowledge/search]", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
