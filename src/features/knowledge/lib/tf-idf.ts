/**
 * Lightweight TF-IDF based text search for Knowledge Base.
 * No external dependencies — runs in Node.js (API routes).
 */

interface TermDoc {
  docId: string;
  terms: Map<string, number>; // term → TF count
}

interface IDFMap {
  [term: string]: number;
}

/** Tokenize: lowercase, split on non-alphanumeric, remove short tokens. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

/** Compute TF (term frequency) for a document. */
export function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

/** Compute IDF (inverse document frequency) across all documents. */
export function computeIDF(docs: TermDoc[]): IDFMap {
  const N = docs.length;
  if (N === 0) return {};
  const df: Record<string, number> = {};
  for (const doc of docs) {
    for (const term of doc.terms.keys()) {
      df[term] = (df[term] ?? 0) + 1;
    }
  }
  const idf: IDFMap = {};
  for (const [term, count] of Object.entries(df)) {
    idf[term] = Math.log((N + 1) / (count + 1)) + 1;
  }
  return idf;
}

/** Compute TF-IDF vector for a document. */
export function tfidfVector(
  tf: Map<string, number>,
  idf: IDFMap,
): Map<string, number> {
  const vec = new Map<string, number>();
  for (const [term, freq] of tf) {
    vec.set(term, freq * (idf[term] ?? 1));
  }
  return vec;
}

/** Cosine similarity between two sparse vectors. */
export function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  let dot = 0, normA = 0, normB = 0;
  for (const [k, va] of a) {
    if (b.has(k)) dot += va * b.get(k)!;
    normA += va * va;
  }
  for (const vb of b.values()) normB += vb * vb;
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/** Build index from documents. Returns { idf, vectors[].docId, vectors[].vector }. */
export function buildSearchIndex(
  documents: { id: string; content: string }[],
): { idf: IDFMap; vectors: { docId: string; vector: Map<string, number> }[] } {
  const docs: TermDoc[] = documents.map((d) => ({
    docId: d.id,
    terms: computeTF(tokenize(d.content)),
  }));
  const idf = computeIDF(docs);
  const vectors = docs.map((d) => ({
    docId: d.docId,
    vector: tfidfVector(d.terms, idf),
  }));
  return { idf, vectors };
}

/** Search: returns top-k docIds with scores, sorted descending. */
export function searchIndex(
  query: string,
  index: ReturnType<typeof buildSearchIndex>,
  topK = 5,
): { docId: string; score: number }[] {
  const qTokens = tokenize(query);
  const qTF = computeTF(qTokens);
  const qVec = tfidfVector(qTF, index.idf);

  const scored = index.vectors
    .map((v) => ({ docId: v.docId, score: cosineSimilarity(qVec, v.vector) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}
