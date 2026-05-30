import { db } from '@/lib/db';
import { handleError, created, paginate } from '@/lib/api-error';
import { flowCreateSchema, paginationSchema } from '@/lib/validations';

/** GET /api/flows -- list all flows (latest first). */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = paginationSchema.parse(Object.fromEntries(url.searchParams));
    const total = await db.flow.count();
    const flows = await db.flow.findMany({
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { updatedAt: 'desc' },
    });
    return paginate(flows, total, query.page, query.pageSize);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/flows -- create a new flow. */
export async function POST(request: Request) {
  try {
    const body = flowCreateSchema.parse(await request.json());

    const flow = await db.flow.create({
      data: {
        name: body.name ?? 'Untitled Flow',
        description: body.description ?? '',
        nodes: JSON.stringify(body.nodes ?? []),
        edges: JSON.stringify(body.edges ?? []),
      },
    });

    return created(flow);
  } catch (error) {
    return handleError(error);
  }
}
