import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';
import { knowledgeCreateSchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const collection = await db.knowledgeCollection.findUnique({
      where: { id },
      include: { documents: { orderBy: { createdAt: 'desc' } } },
    });
    if (!collection) throw NotFound('Collection not found');
    return success({
      ...collection,
      tags: JSON.parse(collection.tags),
      documents: collection.documents.map((d) => ({ ...d, tags: JSON.parse(d.tags) })),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = knowledgeCreateSchema.partial().parse(await request.json());
    const data: Record<string, unknown> = {};
    if (body.name != null) data.name = body.name;
    if (body.description != null) data.description = body.description;
    if (body.tags != null) data.tags = JSON.stringify(body.tags);
    const collection = await db.knowledgeCollection.update({ where: { id }, data });
    return success(collection);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.knowledgeCollection.delete({ where: { id } });
    return success({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
