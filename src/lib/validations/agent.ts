// ============================================================================
// 3A Studio — Zod validation schemas for API routes
// ============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Agent
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Flow
// ---------------------------------------------------------------------------

export const flowCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
  status: z.enum(['draft', 'active', 'archived']).optional().default('draft'),
  nodes: z.array(z.unknown()).optional().default([]),
  edges: z.array(z.unknown()).optional().default([]),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const flowUpdateSchema = flowCreateSchema.partial();

// ---------------------------------------------------------------------------
// Skill
// ---------------------------------------------------------------------------

export const skillCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().max(50).optional().default('general'),
  description: z.string().max(500).optional().default(''),
  inputSchema: z.record(z.unknown()).optional().default({}),
  outputSchema: z.record(z.unknown()).optional().default({}),
  code: z.string().optional().default(''),
  tests: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  standardIds: z.array(z.string()).optional().default([]),
});

export const skillUpdateSchema = skillCreateSchema.partial();

// ---------------------------------------------------------------------------
// Standard
// ---------------------------------------------------------------------------

export const standardCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().max(50).optional().default('general'),
  description: z.string().max(500).optional().default(''),
  rules: z.array(z.unknown()).optional().default([]),
  severity: z.enum(['info', 'warning', 'error']).optional().default('info'),
  version: z.string().max(20).optional().default('1.0.0'),
});

export const standardUpdateSchema = standardCreateSchema.partial();

// ---------------------------------------------------------------------------
// Knowledge Collection
// ---------------------------------------------------------------------------

export const knowledgeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

// ---------------------------------------------------------------------------
// Knowledge Document
// ---------------------------------------------------------------------------

export const documentCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  fileType: z.enum(['pdf', 'txt', 'md', 'docx']).optional().default('txt'),
  tags: z.array(z.string()).optional().default([]),
});

// ---------------------------------------------------------------------------
// Prompt Template
// ---------------------------------------------------------------------------

export const promptTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().max(50).optional().default('general'),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()).optional().default([]),
  framework: z.string().max(50).optional(),
  tags: z.array(z.string()).optional().default([]),
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
