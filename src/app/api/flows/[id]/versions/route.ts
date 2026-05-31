import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';
import { z } from 'zod';

type RouteParams = { params: Promise<{ id: string }> };

const versionCreateSchema = z.object({
  description: z.string().max(500).optional().default(''),
});

/** GET /api/flows/:id/versions -- list all versions of a flow. */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const flow = await db.flow.findUnique({ where: { id } });
    if (!flow) throw NotFound('Flow not found');

    const versions = await db.flowVersion.findMany({
      where: { flowId: id },
      orderBy: { version: 'desc' },
    });

    return success(versions.map((v) => ({
      ...v,
      nodes: JSON.parse(v.nodes),
      edges: JSON.parse(v.edges),
    })));
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/flows/:id/versions -- create a new version snapshot. */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = versionCreateSchema.parse(await request.json());

    const flow = await db.flow.findUnique({ where: { id } });
    if (!flow) throw NotFound('Flow not found');

    const nextVersion = flow.version + 1;

    const version = await db.flowVersion.create({
      data: {
        flowId: id,
        version: nextVersion,
        nodes: flow.nodes,
        edges: flow.edges,
        description: body.description,
      },
    });

    await db.flow.update({
      where: { id },
      data: { version: nextVersion },
    });

    return success({
      ...version,
      nodes: JSON.parse(version.nodes),
      edges: JSON.parse(version.edges),
    }, 201);
  } catch (error) {
    return handleError(error);
  }
}
