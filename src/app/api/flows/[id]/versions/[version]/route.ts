import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';

type RouteParams = { params: Promise<{ id: string; version: string }> };

/** GET /api/flows/:id/versions/:version -- fetch a specific version. */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id, version: versionStr } = await params;
    const versionNum = parseInt(versionStr, 10);
    if (isNaN(versionNum)) throw NotFound('Invalid version number');

    const version = await db.flowVersion.findUnique({
      where: { flowId_version: { flowId: id, version: versionNum } },
    });
    if (!version) throw NotFound('Version not found');

    return success({
      ...version,
      nodes: JSON.parse(version.nodes),
      edges: JSON.parse(version.edges),
    });
  } catch (error) {
    return handleError(error);
  }
}
