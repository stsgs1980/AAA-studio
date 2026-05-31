import { z } from 'zod';

// Edge validation
const connectionTypeSchema = z.enum([
  'command', 'sync', 'twin', 'delegate', 'feedback', 'supervise', 'broadcast',
]).optional();

export const flowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  type: z.enum(['smoothstep', 'bezier', 'straight', 'animated', 'typed']).optional(),
  connectionType: connectionTypeSchema,
  label: z.string().optional(),
});

// Flow
export const flowCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
  status: z.enum(['draft', 'active', 'archived']).optional().default('draft'),
  nodes: z.array(z.unknown()).optional().default([]),
  edges: z.array(flowEdgeSchema).optional().default([]),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const flowUpdateSchema = flowCreateSchema.partial();

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
