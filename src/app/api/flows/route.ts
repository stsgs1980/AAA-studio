import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/** GET /api/flows — list all flows (latest first). */
export async function GET() {
  try {
    const flows = await db.flow.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(flows);
  } catch (error) {
    console.error('[GET /api/flows]', error);
    return NextResponse.json(
      { error: 'Failed to fetch flows' },
      { status: 500 },
    );
  }
}

/** POST /api/flows — create a new flow. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, nodes, edges } = body;

    const flow = await db.flow.create({
      data: {
        name: name ?? 'Untitled Flow',
        description: description ?? '',
        nodes: JSON.stringify(nodes ?? []),
        edges: JSON.stringify(edges ?? []),
      },
    });

    return NextResponse.json(flow, { status: 201 });
  } catch (error) {
    console.error('[POST /api/flows]', error);
    return NextResponse.json(
      { error: 'Failed to create flow' },
      { status: 500 },
    );
  }
}
