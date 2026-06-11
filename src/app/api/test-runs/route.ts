import { handleError, success, BadRequest } from '@/lib/api-error';
import { getActiveProvider } from '@/lib/llm';
import { executeTestRun, listTestRuns } from '@/lib/services/test-run-service';

/** POST /api/test-runs — execute a test suite and compare results */
export async function POST(request: Request) {
  try {
    const { agentId, caseIds } = await request.json();
    if (!agentId && (!caseIds || !caseIds.length)) throw BadRequest('Provide agentId or caseIds');

    const active = await getActiveProvider();
    if (!active) throw BadRequest('No LLM provider configured');

    const result = await executeTestRun(agentId, caseIds, active);
    return success(result);
  } catch (error) { return handleError(error); }
}

/** GET /api/test-runs — list test runs */
export async function GET() {
  try {
    const runs = await listTestRuns();
    return success(runs);
  } catch (error) { return handleError(error); }
}
