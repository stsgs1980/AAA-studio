// Integration test: Agent API route handlers with mocked DB

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAgent = {
  findMany: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  updateMany: vi.fn(),
};

const mockAgentExecution = { deleteMany: vi.fn() };

vi.mock('@/lib/db', () => ({
  db: { agent: mockAgent, agentExecution: mockAgentExecution },
}));

describe('Agent CRUD routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POST creates agent with valid data', async () => {
    const { POST } = await import('@/app/api/agents/route');
    mockAgent.create.mockResolvedValue({
      id: 'a1', name: 'Test Agent', role: 'coder', roleGroup: 'coder',
      tools: '[]', skills: '["sk-1"]', standards: '["std-1"]',
    });

    const response = await POST(new Request('http://localhost/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Agent', role: 'coder', skills: ['sk-1'], standards: ['std-1'] }),
    }));

    expect(response.status).toBe(201);
    expect(mockAgent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ skills: JSON.stringify(['sk-1']), standards: JSON.stringify(['std-1']) }),
    });
  });

  it('POST rejects invalid data (missing name)', async () => {
    const { POST } = await import('@/app/api/agents/route');
    const response = await POST(new Request('http://localhost/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'coder' }),
    }));

    expect(response.status).toBe(400);
  });

  it('GET returns paginated list', async () => {
    const { GET } = await import('@/app/api/agents/route');
    mockAgent.count.mockResolvedValue(2);
    mockAgent.findMany.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);

    const response = await GET(new Request('http://localhost/api/agents?page=1&pageSize=20'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.total).toBe(2);
    expect(body.items).toHaveLength(2);
  });

  it('PUT updates existing agent', async () => {
    const { PUT } = await import('@/app/api/agents/[id]/route');
    mockAgent.findUnique.mockResolvedValue({ id: 'a1' });
    mockAgent.update.mockResolvedValue({ id: 'a1', name: 'New' });

    const response = await PUT(
      new Request('http://localhost/api/agents/a1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New' }),
      }),
      { params: Promise.resolve({ id: 'a1' }) },
    );

    expect(response.status).toBe(200);
  });

  it('PUT returns 404 for non-existent agent', async () => {
    const { PUT } = await import('@/app/api/agents/[id]/route');
    mockAgent.findUnique.mockResolvedValue(null);

    const response = await PUT(
      new Request('http://localhost/api/agents/x', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      }),
      { params: Promise.resolve({ id: 'x' }) },
    );

    expect(response.status).toBe(404);
  });

  it('DELETE orphans children then deletes', async () => {
    const { DELETE } = await import('@/app/api/agents/[id]/route');
    mockAgent.findUnique.mockResolvedValue({ id: 'a1' });
    mockAgent.updateMany.mockResolvedValue({ count: 2 });
    mockAgentExecution.deleteMany.mockResolvedValue({ count: 5 });
    mockAgent.delete.mockResolvedValue({ id: 'a1' });

    const response = await DELETE(
      new Request('http://localhost/api/agents/a1', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'a1' }) },
    );

    expect(response.status).toBe(200);
    expect(mockAgent.updateMany).toHaveBeenCalledWith({ where: { parentId: 'a1' }, data: { parentId: null } });
    expect(mockAgentExecution.deleteMany).toHaveBeenCalledWith({ where: { agentId: 'a1' } });
  });
});
