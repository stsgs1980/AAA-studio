// Integration test: API route handlers — Agent CRUD + Settings encryption
// Tests route handler logic directly with mocked DB

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma DB
const mockAgent = {
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  updateMany: vi.fn(),
};

const mockAgentExecution = {
  deleteMany: vi.fn(),
};

vi.mock('@/lib/db', () => ({
  db: {
    agent: mockAgent,
    agentExecution: mockAgentExecution,
  },
}));

describe('Agent API route handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/agents — create agent', () => {
    it('creates agent with valid data', async () => {
      const { POST } = await import('@/app/api/agents/route');

      const createdAgent = {
        id: 'agent-1',
        name: 'Test Agent',
        role: 'coder',
        roleGroup: 'coder',
        status: 'draft',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 4096,
        systemPrompt: '',
        tools: '[]',
        skills: '[]',
        standards: '[]',
        parentId: null,
        description: '',
        avatar: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAgent.create.mockResolvedValue(createdAgent);

      const request = new Request('http://localhost/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Agent',
          role: 'coder',
          skills: ['sk-1'],
          standards: ['std-1'],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const body = await response.json();
      expect(body.id).toBe('agent-1');

      // Verify DB was called with correct data
      expect(mockAgent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Test Agent',
          role: 'coder',
          skills: JSON.stringify(['sk-1']),
          standards: JSON.stringify(['std-1']),
        }),
      });
    });

    it('rejects invalid agent data (missing name)', async () => {
      const { POST } = await import('@/app/api/agents/route');

      const request = new Request('http://localhost/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'coder' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const body = await response.json();
      expect(body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/agents — list agents', () => {
    it('returns paginated agent list', async () => {
      const { GET } = await import('@/app/api/agents/route');

      mockAgent.count.mockResolvedValue(2);
      mockAgent.findMany.mockResolvedValue([
        { id: 'a1', name: 'Agent 1', parent: null },
        { id: 'a2', name: 'Agent 2', parent: null },
      ]);

      const request = new Request('http://localhost/api/agents?page=1&pageSize=20');
      const response = await GET(request);

      expect(response.status).toBe(200);

      const body = await response.json();
      expect(body.total).toBe(2);
      expect(body.items).toHaveLength(2);
      expect(body.page).toBe(1);
      expect(body.pageSize).toBe(20);
    });
  });

  describe('PUT /api/agents/[id] — update agent', () => {
    it('updates agent with valid data', async () => {
      const { PUT } = await import('@/app/api/agents/[id]/route');

      const existing = { id: 'a1', name: 'Old Name' };
      const updated = { id: 'a1', name: 'New Name', role: 'reviewer' };

      mockAgent.findUnique.mockResolvedValue(existing);
      mockAgent.update.mockResolvedValue(updated);

      const request = new Request('http://localhost/api/agents/a1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name', role: 'reviewer' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'a1' }) });
      expect(response.status).toBe(200);
    });

    it('returns 404 for non-existent agent', async () => {
      const { PUT } = await import('@/app/api/agents/[id]/route');

      mockAgent.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/agents/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: 'nonexistent' }) });
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/agents/[id] — delete agent', () => {
    it('deletes agent and orphans children', async () => {
      const { DELETE } = await import('@/app/api/agents/[id]/route');

      mockAgent.findUnique.mockResolvedValue({ id: 'a1', name: 'Parent' });
      mockAgent.updateMany.mockResolvedValue({ count: 2 });
      mockAgentExecution.deleteMany.mockResolvedValue({ count: 5 });
      mockAgent.delete.mockResolvedValue({ id: 'a1' });

      const request = new Request('http://localhost/api/agents/a1', { method: 'DELETE' });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'a1' }) });

      expect(response.status).toBe(200);

      // Verify children were orphaned first
      expect(mockAgent.updateMany).toHaveBeenCalledWith({
        where: { parentId: 'a1' },
        data: { parentId: null },
      });

      // Verify executions were deleted
      expect(mockAgentExecution.deleteMany).toHaveBeenCalledWith({
        where: { agentId: 'a1' },
      });

      // Verify agent was deleted
      expect(mockAgent.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
    });

    it('returns 404 for non-existent agent', async () => {
      const { DELETE } = await import('@/app/api/agents/[id]/route');

      mockAgent.findUnique.mockResolvedValue(null);

      const request = new Request('http://localhost/api/agents/nonexistent', { method: 'DELETE' });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'nonexistent' }) });

      expect(response.status).toBe(404);
    });
  });
});

describe('Crypto integration — encryption round-trip', () => {
  beforeEach(() => {
    // Set a valid 64-char hex key (32 bytes) for AES-256-GCM
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  it('encrypt → decrypt round-trip preserves original text', async () => {
    const { encrypt, decrypt } = await import('@/lib/crypto');
    const original = 'sk-test-api-key-12345';
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(original);
    // Encrypted should be different from original
    expect(encrypted).not.toBe(original);
  });

  it('encrypt produces different ciphertext each time (random IV)', async () => {
    const { encrypt } = await import('@/lib/crypto');
    const plaintext = 'same-input';
    const enc1 = encrypt(plaintext);
    const enc2 = encrypt(plaintext);

    // Same input, different IVs → different ciphertext
    expect(enc1).not.toBe(enc2);
  });

  it('decrypt returns input as-is for non-encrypted strings (backward compat)', async () => {
    const { decrypt } = await import('@/lib/crypto');
    const plainText = 'not-encrypted-value';
    expect(decrypt(plainText)).toBe(plainText);
  });
});
