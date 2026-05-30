import { z } from 'zod';

// Agent
export const agentCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  role: z.string().max(200).optional().default(''),
  roleGroup: z.enum([
    'orchestrator', 'planner', 'researcher', 'coder',
    'reviewer', 'tester', 'deployer', 'specialist',
  ]).optional().default('specialist'),
  formula: z.enum(['ToT', 'CoVe', 'ReWOO', 'Reflexion', 'ReAct', 'MoA', '']).optional().default(''),
  status: z.enum(['active', 'inactive', 'draft']).optional().default('draft'),
  model: z.string().max(50).optional().default('gpt-4'),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().int().min(1).max(128000).optional().default(4096),
  systemPrompt: z.string().optional().default(''),
  tools: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  standards: z.array(z.string()).optional().default([]),
  parentId: z.string().nullable().optional(),
  description: z.string().max(500).optional().default(''),
  avatar: z.string().max(200).optional().default(''),
});

export const agentUpdateSchema = agentCreateSchema.partial();

export const agentQuerySchema = z.object({
  search: z.string().optional(),
  group: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft']).optional(),
  executions: z.enum(['true', 'false']).optional(),
});
