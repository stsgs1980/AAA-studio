import { z } from 'zod';

// Flow
export const flowCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
  status: z.enum(['draft', 'active', 'archived']).optional().default('draft'),
  nodes: z.array(z.unknown()).optional().default([]),
  edges: z.array(z.unknown()).optional().default([]),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const flowUpdateSchema = flowCreateSchema.partial();

// Skill
export const skillCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional(),                       // auto-generated if empty
  version: z.string().max(20).optional().default('1.0.0'),
  skillId: z.string().max(30).optional().default(''),
  category: z.string().max(50).optional().default('general'),
  description: z.string().max(500).optional().default(''),
  longDescription: z.string().optional().default(''),
  inputSchema: z.record(z.unknown()).optional().default({}),
  outputSchema: z.record(z.unknown()).optional().default({}),
  code: z.string().optional().default(''),
  tests: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  triggers: z.array(z.string()).optional().default([]),
  standardIds: z.array(z.string()).optional().default([]),
  compatibility: z.enum(['both', 'sandbox', 'local']).optional().default('both'),
  dependencies: z.array(z.object({ skillId: z.string(), version: z.string() })).optional().default([]),
  annotations: z.record(z.boolean()).optional().default({}),
  author: z.string().max(100).optional().default(''),
  license: z.string().max(50).optional().default('MIT'),
});

export const skillUpdateSchema = skillCreateSchema.partial();

// Standard
export const standardCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().max(50).optional().default('general'),
  description: z.string().max(500).optional().default(''),
  rules: z.array(z.unknown()).optional().default([]),
  severity: z.enum(['info', 'warning', 'error']).optional().default('info'),
  version: z.string().max(20).optional().default('1.0.0'),
});

export const standardUpdateSchema = standardCreateSchema.partial();
