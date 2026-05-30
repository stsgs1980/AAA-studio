import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';
import { flowUpdateSchema } from '@/lib/validations';

type RouteParams = { params: Promise<{ id: string }> };

/** GET /api/flows/:id — fetch a single flow with parsed nodes/edges. */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const flow = await db.flow.findUnique({ where: { id } });
    if (!flow) throw NotFound('Flow not found');
    return success({
      ...flow,
      nodes: JSON.parse(flow.nodes),
      edges: JSON.parse(flow.edges),
    });
  } catch (error) {
    return handleError(error);
  }
}

/** PUT /api/flows/:id — update a flow (nodes, edges, name, status). */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = flowUpdateSchema.parse(await request.json());

    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.description != null) data.description = body.description;
    if (body.nodes != null) data.nodes = JSON.stringify(body.nodes);
    if (body.edges != null) data.edges = JSON.stringify(body.edges);
    if (body.status != null) data.status = body.status;

    const flow = await db.flow.update({ where: { id }, data });
    return success(flow);
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/flows/:id — delete a flow and its versions. */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await db.flow.delete({ where: { id } });
    return success({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
