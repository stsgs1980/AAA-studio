import { db } from '@/lib/db';
import { handleError, created, NotFound, BadRequest } from '@/lib/api-error';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const collection = await db.knowledgeCollection.findUnique({ where: { id } });
    if (!collection) throw NotFound('Collection not found');

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const tagsRaw = formData.get('tags') as string | null;

    let content = '';
    let fileType = 'txt';

    if (file) {
      fileType = file.name.split('.').pop()?.toLowerCase() ?? 'txt';
      if (!['txt', 'md', 'pdf', 'docx'].includes(fileType)) {
        throw BadRequest(`Unsupported file type: ${fileType}`);
      }
      content = await file.text();
    }

    if (!content.trim() && !file) {
      throw BadRequest('Content or file is required');
    }

    const doc = await db.knowledgeDocument.create({
      data: {
        collectionId: id,
        title: title ?? (file?.name ?? 'Untitled Document'),
        content,
        fileType,
        tags: JSON.stringify(tagsRaw ? tagsRaw.split(',').map((t) => t.trim()) : []),
      },
    });

    return created(doc);
  } catch (error) {
    return handleError(error);
  }
}
