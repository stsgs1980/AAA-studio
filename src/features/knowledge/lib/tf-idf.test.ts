import { describe, it, expect } from 'vitest';
import { tokenize, computeTF, computeIDF, cosineSimilarity, buildSearchIndex, searchIndex } from './tf-idf';

describe('tokenize', () => {
  it('tokenizes English text', () => {
    const tokens = tokenize('Hello World Test');
    expect(tokens).toContain('hello');
    expect(tokens).toContain('world');
    expect(tokens).toContain('test');
  });

  it('tokenizes Cyrillic text', () => {
    const tokens = tokenize('Привет Мир Тест');
    expect(tokens).toContain('привет');
    expect(tokens).toContain('мир');
    expect(tokens).toContain('тест');
  });

  it('lowercases tokens', () => {
    const tokens = tokenize('HELLO');
    expect(tokens).toEqual(['hello']);
  });

  it('handles empty string', () => {
    const tokens = tokenize('');
    expect(tokens).toEqual([]);
  });
});

describe('computeTF', () => {
  it('computes term counts', () => {
    const tf = computeTF(['hello', 'hello', 'world']);
    expect(tf.get('hello')).toBe(2);
    expect(tf.get('world')).toBe(1);
  });
});

describe('cosineSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const vec = new Map([['a', 1], ['b', 2]]);
    expect(cosineSimilarity(vec, vec)).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    const a = new Map([['x', 1]]);
    const b = new Map([['y', 1]]);
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
  });
});

describe('buildSearchIndex + searchIndex', () => {
  it('finds matching documents', () => {
    const docs = [
      { id: '1', content: 'React component library for UI' },
      { id: '2', content: 'Python machine learning framework' },
      { id: '3', content: 'React state management store' },
    ];
    const index = buildSearchIndex(docs);
    const results = searchIndex('React UI', index);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].docId).toBe('1');
  });

  it('returns empty for no matches', () => {
    const docs = [
      { id: '1', content: 'React component library' },
    ];
    const index = buildSearchIndex(docs);
    const results = searchIndex('quantum physics', index);
    expect(results.length).toBe(0);
  });
});
