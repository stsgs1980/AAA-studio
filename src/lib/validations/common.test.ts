import { describe, it, expect } from 'vitest';
import { paginationSchema, knowledgeCreateSchema, taskCreateSchema } from './common';

describe('paginationSchema', () => {
  it('applies defaults', () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    }
  });

  it('coerces string to number', () => {
    const result = paginationSchema.safeParse({ page: '3', pageSize: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

describe('knowledgeCreateSchema', () => {
  it('validates valid collection', () => {
    const result = knowledgeCreateSchema.safeParse({
      name: 'Test Collection',
      description: 'A test',
    });
    expect(result.success).toBe(true);
  });

  it('requires name', () => {
    const result = knowledgeCreateSchema.safeParse({ description: 'No name' });
    expect(result.success).toBe(false);
  });
});

describe('taskCreateSchema', () => {
  it('validates valid task', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Test Task',
      description: 'A test task',
      agentId: 'agent-1',
    });
    expect(result.success).toBe(true);
  });

  it('requires title', () => {
    const result = taskCreateSchema.safeParse({ agentId: 'agent-1' });
    expect(result.success).toBe(false);
  });
});
