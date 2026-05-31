// Integration test: Cross-reference deletion protection logic
// Simulates the checks in /api/skills/[id] DELETE and /api/standards/[id] DELETE

import { describe, it, expect } from 'vitest';

describe('Cross-reference deletion protection', () => {
  it('detects skills referencing a standard before deletion', () => {
    const skills = [
      { id: 'sk-1', name: 'Skill A', standardIds: '["std-1","std-2"]' },
      { id: 'sk-2', name: 'Skill B', standardIds: '["std-3"]' },
      { id: 'sk-3', name: 'Skill C', standardIds: '[]' },
    ];
    const linked = skills.filter(s => JSON.parse(s.standardIds).includes('std-1'));
    expect(linked).toHaveLength(1);
    expect(linked[0].id).toBe('sk-1');
  });

  it('detects agents referencing a skill before deletion', () => {
    const agents = [
      { id: 'ag-1', name: 'Agent A', skills: '["sk-1","sk-2"]' },
      { id: 'ag-2', name: 'Agent B', skills: '["sk-3"]' },
      { id: 'ag-3', name: 'Agent C', skills: '[]' },
    ];
    const linked = agents.filter(a => JSON.parse(a.skills).includes('sk-1'));
    expect(linked).toHaveLength(1);
    expect(linked[0].id).toBe('ag-1');
  });

  it('detects agents referencing a standard before deletion', () => {
    const agents = [
      { id: 'ag-1', name: 'Agent A', standards: '["std-1"]' },
      { id: 'ag-2', name: 'Agent B', standards: '["std-2"]' },
    ];
    const linked = agents.filter(a => JSON.parse(a.standards).includes('std-1'));
    expect(linked).toHaveLength(1);
  });

  it('allows deletion when no references exist', () => {
    const skills = [{ id: 'sk-1', name: 'Skill A', standardIds: '["std-2"]' }];
    const linked = skills.filter(s => JSON.parse(s.standardIds).includes('std-1'));
    expect(linked).toHaveLength(0);
  });

  it('multiple skills can reference same standard', () => {
    const skills = [
      { id: 'sk-1', standardIds: '["std-1"]' },
      { id: 'sk-2', standardIds: '["std-1"]' },
      { id: 'sk-3', standardIds: '["std-2"]' },
    ];
    const linked = skills.filter(s => JSON.parse(s.standardIds).includes('std-1'));
    expect(linked).toHaveLength(2);
  });

  it('agent can reference multiple skills and standards', () => {
    const agent = { skills: '["sk-1","sk-2","sk-3"]', standards: '["std-1","std-2"]' };
    expect(JSON.parse(agent.skills)).toHaveLength(3);
    expect(JSON.parse(agent.standards)).toHaveLength(2);
  });
});
