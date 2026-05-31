// Integration test: Cross-reference validation — Zod schemas + JSON serialization

import { describe, it, expect } from 'vitest';
import { agentCreateSchema, agentUpdateSchema } from '@/lib/validations/agent';
import { skillCreateSchema, skillUpdateSchema } from '@/lib/validations/skill';
import { standardCreateSchema } from '@/lib/validations/flow';

describe('Cross-reference validation', () => {
  it('accepts agent with skills and standards arrays', () => {
    const result = agentCreateSchema.safeParse({
      name: 'Code Review Agent', skills: ['skill-1', 'skill-2'], standards: ['std-1', 'std-2'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual(['skill-1', 'skill-2']);
      expect(result.data.standards).toEqual(['std-1', 'std-2']);
    }
  });

  it('defaults skills and standards to empty arrays', () => {
    const result = agentCreateSchema.safeParse({ name: 'Basic Agent' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual([]);
      expect(result.data.standards).toEqual([]);
    }
  });

  it('rejects non-array skills', () => {
    const result = agentCreateSchema.safeParse({
      name: 'Agent', skills: 'not-an-array',
    } as unknown as Parameters<typeof agentCreateSchema.parse>[0]);
    expect(result.success).toBe(false);
  });

  it('accepts skill with standardIds', () => {
    const result = skillCreateSchema.safeParse({
      name: 'Linter', standardIds: ['std-quality-001', 'std-security-001'],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.standardIds).toEqual(['std-quality-001', 'std-security-001']);
    }
  });

  it('accepts standard with rules and severity', () => {
    const result = standardCreateSchema.safeParse({
      name: 'No Any Type', category: 'quality', severity: 'error',
      rules: [{ name: 'no-any', description: 'No any', pattern: ':\\s*any', enabled: true }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.severity).toBe('error');
      expect(result.data.rules).toHaveLength(1);
    }
  });

  it('rejects invalid severity', () => {
    const result = standardCreateSchema.safeParse({ name: 'S', severity: 'critical' });
    expect(result.success).toBe(false);
  });

  it('JSON round-trip: Agent skills/standards', () => {
    const original = { skills: ['sk-1'], standards: ['std-1'] };
    expect(JSON.parse(JSON.stringify(original.skills))).toEqual(original.skills);
    expect(JSON.parse(JSON.stringify(original.standards))).toEqual(original.standards);
  });

  it('JSON round-trip: Standard rules', () => {
    const rules = [{ name: 'r1', description: 'Rule', pattern: 'test', enabled: true }];
    expect(JSON.parse(JSON.stringify(rules))).toEqual(rules);
  });
});
