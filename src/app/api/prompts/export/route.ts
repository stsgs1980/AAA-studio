// ============================================================================
// GET /api/prompts/export -- Export agent prompts in multiple formats
// Query params: format=json|yaml|markdown, agentId=optional
// ============================================================================

import { handleError, success, BadRequest } from '@/lib/api-error';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    const agentId = url.searchParams.get('agentId');

    if (!['json', 'yaml', 'markdown'].includes(format)) {
      throw BadRequest('Format must be json, yaml, or markdown');
    }

    const where = agentId ? { id: agentId } : {};
    const agents = await db.agent.findMany({
      where,
      select: { id: true, name: true, role: true, roleGroup: true, systemPrompt: true, description: true },
      orderBy: { name: 'asc' },
    });

    if (!agents.length) {
      return success({ format, content: '', count: 0 });
    }

    let content: string;

    if (format === 'json') {
      content = JSON.stringify(agents.map(a => ({
        name: a.name, role: a.role, group: a.roleGroup,
        description: a.description, prompt: a.systemPrompt,
      })), null, 2);
    } else if (format === 'yaml') {
      content = agents.map(a => [
        `- name: "${a.name}"`,
        `  role: "${a.role}"`,
        `  group: "${a.roleGroup}"`,
        `  description: "${(a.description || '').replace(/"/g, '\\"')}"`,
        `  prompt: |`,
        ...a.systemPrompt.split('\n').map(l => `    ${l}`),
      ].join('\n')).join('\n');
    } else {
      // markdown
      content = agents.map(a => [
        `## ${a.name}`,
        '',
        `**Role:** ${a.role}  `,
        `**Group:** ${a.roleGroup}  `,
        a.description ? `**Description:** ${a.description}  ` : '',
        '',
        '### System Prompt',
        '',
        '```',
        a.systemPrompt,
        '```',
        '',
      ].join('\n')).join('---\n\n');
    }

    return success({ format, content, count: agents.length });
  } catch (error) {
    return handleError(error);
  }
}
