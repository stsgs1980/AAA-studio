import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/flows/:id — fetch a single flow with parsed nodes/edges. */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const flow = await db.flow.findUnique({ where: { id } });
    if (!flow) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...flow,
      nodes: JSON.parse(flow.nodes),
      edges: JSON.parse(flow.edges),
    });
  } catch (error) {
    console.error('[GET /api/flows/:id]', error);
    return NextResponse.json(
      { error: 'Failed to fetch flow' },
      { status: 500 },
    );
  }
}

/** PUT /api/flows/:id — update a flow (nodes, edges, name, status). */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, nodes, edges, status } = body;

    const data: Record<string, unknown> = {};
    if (name != null) data.name = name;
    if (description != null) data.description = description;
    if (nodes != null) data.nodes = JSON.stringify(nodes);
    if (edges != null) data.edges = JSON.stringify(edges);
    if (status != null) data.status = status;

    const flow = await db.flow.update({ where: { id }, data });
    return NextResponse.json(flow);
  } catch (error) {
    console.error('[PUT /api/flows/:id]', error);
    return NextResponse.json(
      { error: 'Failed to update flow' },
      { status: 500 },
    );
  }
}

/** DELETE /api/flows/:id — delete a flow and its versions. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await db.flow.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/flows/:id]', error);
    return NextResponse.json(
      { error: 'Failed to delete flow' },
      { status: 500 },
    );
  }
}
