import { describe, it, expect } from 'vitest';
import { agentCreateSchema, agentUpdateSchema, agentQuerySchema } from './agent';

describe('agentCreateSchema', () => {
  it('validates valid agent', () => {
    const result = agentCreateSchema.safeParse({
      name: 'Test Agent',
      role: 'assistant',
    });
    expect(result.success).toBe(true);
  });

  it('requires name', () => {
    const result = agentCreateSchema.safeParse({ role: 'assistant' });
    expect(result.success).toBe(false);
  });

  it('applies defaults', () => {
    const result = agentCreateSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('draft');
      expect(result.data.model).toBe('gpt-4');
      expect(result.data.temperature).toBe(0.7);
    }
  });
});

describe('agentUpdateSchema', () => {
  it('allows partial updates', () => {
    const result = agentUpdateSchema.safeParse({ name: 'Updated' });
    expect(result.success).toBe(true);
  });

  it('allows empty object', () => {
    const result = agentUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('agentQuerySchema', () => {
  it('validates search and group', () => {
    const result = agentQuerySchema.safeParse({ search: 'test', group: 'coder' });
    expect(result.success).toBe(true);
  });

  it('validates status filter', () => {
    const result = agentQuerySchema.safeParse({ status: 'active' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = agentQuerySchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });
});
