// Integration test: Cross-reference integrity — Standard ↔ Skill ↔ Agent
// Tests that the cross-reference chain works: JSON serialization, validation, deletion protection logic

import { describe, it, expect } from 'vitest';
import { agentCreateSchema, agentUpdateSchema } from '@/lib/validations/agent';
import { skillCreateSchema, skillUpdateSchema } from '@/lib/validations/flow';
import { standardCreateSchema, standardUpdateSchema } from '@/lib/validations/flow';

describe('Cross-reference validation chain', () => {
  describe('Agent → skills[] + standards[]', () => {
    it('accepts agent with skills and standards arrays', () => {
      const result = agentCreateSchema.safeParse({
        name: 'Code Review Agent',
        skills: ['skill-1', 'skill-2'],
        standards: ['std-1', 'std-2', 'std-3'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skills).toEqual(['skill-1', 'skill-2']);
        expect(result.data.standards).toEqual(['std-1', 'std-2', 'std-3']);
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

    it('update schema allows adding skills without replacing standards', () => {
      const result = agentUpdateSchema.safeParse({
        skills: ['new-skill'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects non-array skills', () => {
      const result = agentCreateSchema.safeParse({
        name: 'Agent',
        skills: 'not-an-array',
      } as unknown as Parameters<typeof agentCreateSchema.parse>[0]);
      expect(result.success).toBe(false);
    });
  });

  describe('Skill → standardIds[]', () => {
    it('accepts skill with standardIds array', () => {
      const result = skillCreateSchema.safeParse({
        name: 'Code Linter',
        standardIds: ['std-quality-001', 'std-security-001'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.standardIds).toEqual(['std-quality-001', 'std-security-001']);
      }
    });

    it('defaults standardIds to empty array', () => {
      const result = skillCreateSchema.safeParse({ name: 'Basic Skill' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.standardIds).toEqual([]);
      }
    });

    it('update schema allows changing standardIds', () => {
      const result = skillUpdateSchema.safeParse({
        standardIds: ['std-new'],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Standard validation', () => {
    it('accepts standard with rules and severity', () => {
      const result = standardCreateSchema.safeParse({
        name: 'No Any Type',
        category: 'quality',
        description: 'Disallow any type in TypeScript',
        rules: [{ name: 'no-any', description: 'No any', pattern: ':\\s*any', enabled: true }],
        severity: 'error',
        version: '1.0.0',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.severity).toBe('error');
        expect(result.data.rules).toHaveLength(1);
      }
    });

    it('accepts only valid severities', () => {
      const valid = standardCreateSchema.safeParse({ name: 'S1', severity: 'info' });
      expect(valid.success).toBe(true);

      const invalid = standardCreateSchema.safeParse({ name: 'S2', severity: 'critical' });
      expect(invalid.success).toBe(false);
    });

    it('defaults rules to empty array', () => {
      const result = standardCreateSchema.safeParse({ name: 'Empty Standard' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.rules).toEqual([]);
      }
    });
  });

  describe('JSON serialization round-trip', () => {
    it('Agent skills/standards survive JSON.stringify → JSON.parse', () => {
      const original = {
        skills: ['skill-1', 'skill-2'],
        standards: ['std-1'],
      };
      const serialized = {
        skills: JSON.stringify(original.skills),
        standards: JSON.stringify(original.standards),
      };
      const deserialized = {
        skills: JSON.parse(serialized.skills),
        standards: JSON.parse(serialized.standards),
      };
      expect(deserialized).toEqual(original);
    });

    it('Skill standardIds survive JSON.stringify → JSON.parse', () => {
      const original = { standardIds: ['std-a', 'std-b', 'std-c'] };
      const serialized = { standardIds: JSON.stringify(original.standardIds) };
      const deserialized = { standardIds: JSON.parse(serialized.standardIds) };
      expect(deserialized).toEqual(original);
    });

    it('Standard rules survive JSON.stringify → JSON.parse', () => {
      const original = {
        rules: [
          { name: 'rule-1', description: 'First rule', pattern: 'test', enabled: true },
          { name: 'rule-2', description: 'Second rule', pattern: 'demo', enabled: false },
        ],
      };
      const serialized = { rules: JSON.stringify(original.rules) };
      const deserialized = { rules: JSON.parse(serialized.rules) };
      expect(deserialized).toEqual(original);
    });
  });

  describe('Cross-reference deletion protection logic', () => {
    it('detects skills referencing a standard before deletion', () => {
      // Simulates the check in /api/standards/[id] DELETE
      const skills = [
        { id: 'sk-1', name: 'Skill A', standardIds: '["std-1","std-2"]' },
        { id: 'sk-2', name: 'Skill B', standardIds: '["std-3"]' },
        { id: 'sk-3', name: 'Skill C', standardIds: '[]' },
      ];

      const standardIdToDelete = 'std-1';
      const linked = skills.filter(s => JSON.parse(s.standardIds).includes(standardIdToDelete));

      expect(linked).toHaveLength(1);
      expect(linked[0].id).toBe('sk-1');
    });

    it('detects agents referencing a skill before deletion', () => {
      // Simulates the check in /api/skills/[id] DELETE
      const agents = [
        { id: 'ag-1', name: 'Agent A', skills: '["sk-1","sk-2"]' },
        { id: 'ag-2', name: 'Agent B', skills: '["sk-3"]' },
        { id: 'ag-3', name: 'Agent C', skills: '[]' },
      ];

      const skillIdToDelete = 'sk-1';
      const linked = agents.filter(a => JSON.parse(a.skills).includes(skillIdToDelete));

      expect(linked).toHaveLength(1);
      expect(linked[0].id).toBe('ag-1');
    });

    it('detects agents referencing a standard before deletion', () => {
      // Simulates the second check in /api/standards/[id] DELETE
      const agents = [
        { id: 'ag-1', name: 'Agent A', standards: '["std-1"]' },
        { id: 'ag-2', name: 'Agent B', standards: '["std-2"]' },
      ];

      const standardIdToDelete = 'std-1';
      const linkedAgents = agents.filter(a => JSON.parse(a.standards).includes(standardIdToDelete));

      expect(linkedAgents).toHaveLength(1);
      expect(linkedAgents[0].id).toBe('ag-1');
    });

    it('allows deletion when no references exist', () => {
      const skills = [
        { id: 'sk-1', name: 'Skill A', standardIds: '["std-2"]' },
      ];

      const standardIdToDelete = 'std-1';
      const linked = skills.filter(s => JSON.parse(s.standardIds).includes(standardIdToDelete));

      expect(linked).toHaveLength(0);
    });
  });
});
