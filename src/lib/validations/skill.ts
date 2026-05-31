import { z } from 'zod';

export const skillCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional(),
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
