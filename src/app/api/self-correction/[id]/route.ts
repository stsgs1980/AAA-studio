import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';

type Params = { params: Promise<{ id: string }> };

/** GET /api/self-correction/:id -- single session */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const session = await db.selfCorrectionSession.findUnique({
      where: { id },
      include: { agent: { select: { id: true, name: true, roleGroup: true } } },
    });
    if (!session) throw NotFound('Session not found');
    return success(session);
  } catch (error) {
    return handleError(error);
  }
}

/** DELETE /api/self-correction/:id */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    await db.selfCorrectionSession.delete({ where: { id } });
    return success({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
