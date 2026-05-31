import { db } from '@/lib/db';
import { handleError, success, NotFound } from '@/lib/api-error';

type P = { params: Promise<{ id: string }> };

/** PUT /api/test-cases/:id — update test case */
export async function PUT(request: Request, { params }: P) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existing = await db.testCase.findUnique({ where: { id } });
    if (!existing) throw NotFound('Test case not found');
    const tc = await db.testCase.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.input && { input: JSON.stringify(body.input) }),
        ...(body.expectedOutput && { expectedOutput: JSON.stringify(body.expectedOutput) }),
        ...(body.category && { category: body.category }),
        ...(body.difficulty && { difficulty: body.difficulty }),
        ...(body.tags !== undefined && { tags: body.tags }),
      },
    });
    return success({ ...tc, input: JSON.parse(tc.input), expectedOutput: JSON.parse(tc.expectedOutput) });
  } catch (error) { return handleError(error); }
}

/** DELETE /api/test-cases/:id */
export async function DELETE(_req: Request, { params }: P) {
  try {
    const { id } = await params;
    await db.testResult.deleteMany({ where: { caseId: id } });
    await db.testCase.delete({ where: { id } });
    return success({ deleted: true });
  } catch (error) { return handleError(error); }
}
