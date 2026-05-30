import { db } from '@/lib/db';
import { handleError, success, created } from '@/lib/api-error';
import { knowledgeCreateSchema } from '@/lib/validations';

export async function GET() {
  try {
    const collections = await db.knowledgeCollection.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { documents: true } } },
    });
    return success(collections);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = knowledgeCreateSchema.parse(await request.json());
    const collection = await db.knowledgeCollection.create({
      data: {
        name: body.name.trim(),
        description: body.description ?? '',
        tags: JSON.stringify(body.tags ?? []),
      },
    });
    return created(collection);
  } catch (error) {
    return handleError(error);
  }
}
