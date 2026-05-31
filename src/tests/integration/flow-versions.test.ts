// Integration test: Flow Version API endpoints with mocked DB

import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFlow = { findUnique: vi.fn(), update: vi.fn() };
const mockFlowVersion = { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() };

vi.mock('@/lib/db', () => ({
  db: { flow: mockFlow, flowVersion: mockFlowVersion },
}));

const NODES = JSON.stringify([{ id: 's1', type: 'start', position: { x: 0, y: 0 }, data: {} }]);
const EDGES = JSON.stringify([{ id: 'e1', source: 's1', target: 'l1', type: 'typed' }]);

describe('Flow Version routes', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('GET /versions returns list', async () => {
    const { GET } = await import('@/app/api/flows/[id]/versions/route');
    mockFlow.findUnique.mockResolvedValue({ id: 'f1' });
    mockFlowVersion.findMany.mockResolvedValue([
      { id: 'v1', flowId: 'f1', version: 1, nodes: NODES, edges: EDGES, description: 'init' },
    ]);

    const response = await GET(
      new Request('http://localhost/api/flows/f1/versions'),
      { params: Promise.resolve({ id: 'f1' }) },
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toHaveLength(1);
  });

  it('POST /versions creates version + increments flow.version', async () => {
    const { POST } = await import('@/app/api/flows/[id]/versions/route');
    mockFlow.findUnique.mockResolvedValue({ id: 'f1', version: 1, nodes: NODES, edges: EDGES });
    mockFlowVersion.create.mockResolvedValue({ id: 'v2', flowId: 'f1', version: 2, nodes: NODES, edges: EDGES, description: '' });
    mockFlow.update.mockResolvedValue({ id: 'f1', version: 2 });

    const response = await POST(
      new Request('http://localhost/api/flows/f1/versions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'Second version' }),
      }),
      { params: Promise.resolve({ id: 'f1' }) },
    );

    expect(response.status).toBe(200);
    expect(mockFlowVersion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ version: 2, description: 'Second version' }),
    });
    expect(mockFlow.update).toHaveBeenCalledWith({ where: { id: 'f1' }, data: { version: 2 } });
  });

  it('GET /versions/:version returns specific version', async () => {
    const { GET } = await import('@/app/api/flows/[id]/versions/[version]/route');
    mockFlowVersion.findUnique.mockResolvedValue({ id: 'v1', flowId: 'f1', version: 1, nodes: NODES, edges: EDGES });

    const response = await GET(
      new Request('http://localhost/api/flows/f1/versions/1'),
      { params: Promise.resolve({ id: 'f1', version: '1' }) },
    );
    expect(response.status).toBe(200);
  });

  it('GET /versions/:version returns 404 for missing', async () => {
    const { GET } = await import('@/app/api/flows/[id]/versions/[version]/route');
    mockFlowVersion.findUnique.mockResolvedValue(null);

    const response = await GET(
      new Request('http://localhost/api/flows/f1/versions/99'),
      { params: Promise.resolve({ id: 'f1', version: '99' }) },
    );
    expect(response.status).toBe(404);
  });
});
