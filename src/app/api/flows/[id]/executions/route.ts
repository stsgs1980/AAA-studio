import { db } from '@/lib/db';
import { handleError, success } from '@/lib/api-error';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const executions = await db.pipelineExecution.findMany({
      where: { flowId: id },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    return success(executions);
  } catch (error) {
    return handleError(error);
  }
}
