import { z } from 'zod';

// Knowledge Collection
export const knowledgeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

// Knowledge Document
export const documentCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  fileType: z.enum(['pdf', 'txt', 'md', 'docx']).optional().default('txt'),
  tags: z.array(z.string()).optional().default([]),
});

// Prompt Template
export const promptTemplateCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: z.string().max(50).optional().default('general'),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()).optional().default([]),
  framework: z.string().max(50).optional(),
  tags: z.array(z.string()).optional().default([]),
});

// Task
export const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional().default(''),
  status: z.enum(['pending', 'running', 'completed', 'failed']).optional().default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  agentId: z.string().nullable().optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial();

// Workflow
export const workflowCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
  triggerType: z.enum(['manual', 'event', 'schedule', 'webhook', 'agent']).optional().default('manual'),
  triggerConfig: z.record(z.unknown()).optional().default({}),
  tags: z.string().max(500).optional().default(''),
});

export const workflowUpdateSchema = workflowCreateSchema.partial();

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});
