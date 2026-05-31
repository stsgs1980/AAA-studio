// Integration test: Flow API route handlers with mocked DB

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFlow = {
  findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(),
  update: vi.fn(), delete: vi.fn(), count: vi.fn(),
};

vi.mock('@/lib/db', () => ({
  db: { flow: mockFlow, flowVersion: {} },
}));

const NODES = JSON.stringify([{ id: 's1', type: 'start', position: { x: 0, y: 0 }, data: {} }]);
const EDGES = JSON.stringify([{ id: 'e1', source: 's1', target: 'l1', type: 'typed' }]);

describe('Flow CRUD routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('POST creates flow with valid data', async () => {
    const { POST } = await import('@/app/api/flows/route');
    mockFlow.create.mockResolvedValue({ id: 'f1', name: 'Test Flow', version: 1, status: 'draft', nodes: NODES, edges: EDGES, metadata: '{}' });

    const response = await POST(new Request('http://localhost/api/flows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Flow', nodes: [], edges: [] }),
    }));

    expect(response.status).toBe(200);
  });

  it('POST rejects flow without name', async () => {
    const { POST } = await import('@/app/api/flows/route');
    const response = await POST(new Request('http://localhost/api/flows', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'No name' }),
    }));
    expect(response.status).toBe(400);
  });

  it('GET returns flow with parsed nodes/edges', async () => {
    const { GET } = await import('@/app/api/flows/[id]/route');
    mockFlow.findUnique.mockResolvedValue({ id: 'f1', name: 'Test', nodes: NODES, edges: EDGES });

    const response = await GET(
      new Request('http://localhost/api/flows/f1'),
      { params: Promise.resolve({ id: 'f1' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.nodes)).toBe(true);
  });

  it('PUT updates flow', async () => {
    const { PUT } = await import('@/app/api/flows/[id]/route');
    mockFlow.update.mockResolvedValue({ id: 'f1', name: 'Updated' });

    const response = await PUT(
      new Request('http://localhost/api/flows/f1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated', nodes: [], edges: [] }),
      }),
      { params: Promise.resolve({ id: 'f1' }) },
    );
    expect(response.status).toBe(200);
  });

  it('DELETE removes flow', async () => {
    const { DELETE } = await import('@/app/api/flows/[id]/route');
    mockFlow.delete.mockResolvedValue({ id: 'f1' });

    const response = await DELETE(
      new Request('http://localhost/api/flows/f1', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'f1' }) },
    );
    expect(response.status).toBe(200);
  });
});
