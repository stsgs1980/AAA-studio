import { db } from '@/lib/db';
import { handleError, success, BadRequest } from '@/lib/api-error';

/** GET /api/test-cases — list test cases */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    const category = url.searchParams.get('category');
    const where: Record<string, unknown> = {};
    if (agentId) where.agentId = agentId;
    if (category) where.category = category;
    const cases = await db.testCase.findMany({ where, orderBy: { name: 'asc' }, take: 100 });
    return success(cases.map((c) => ({
      ...c, input: JSON.parse(c.input), expectedOutput: JSON.parse(c.expectedOutput),
    })));
  } catch (error) { return handleError(error); }
}

/** POST /api/test-cases — create test case */
export async function POST(request: Request) {
  try {
    const { name, agentId, input, expectedOutput, category, difficulty, tags } = await request.json();
    if (!name) throw BadRequest('Name is required');
    const tc = await db.testCase.create({
      data: {
        name, agentId: agentId ?? null,
        input: JSON.stringify(input ?? {}), expectedOutput: JSON.stringify(expectedOutput ?? {}),
        category: category ?? 'general', difficulty: difficulty ?? 'medium',
        tags: tags ?? '',
      },
    });
    return success({ ...tc, input: JSON.parse(tc.input), expectedOutput: JSON.parse(tc.expectedOutput) }, 201);
  } catch (error) { return handleError(error); }
}
