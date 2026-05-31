// ============================================================================
// POST /api/agents/import -- Import agents from a ZIP archive
// Expects multipart/form-data with a .zip file containing agent JSON files.
// Each JSON file should match the Agent create schema.
// ============================================================================

import { handleError, created, BadRequest } from '@/lib/api-error';
import { db } from '@/lib/db';
import { agentCreateSchema } from '@/lib/validations';
import JSZip from 'jszip';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw BadRequest('No ZIP file provided. Upload a .zip with agent JSON files.');
    }

    if (!file.name.endsWith('.zip')) {
      throw BadRequest('Only .zip files are accepted.');
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = await JSZip.loadAsync(buffer);

    const results: Array<{ name: string; status: 'created' | 'skipped' | 'error'; reason?: string }> = [];
    const jsonFiles = Object.entries(zip.files).filter(
      ([name, entry]) => !entry.dir && name.endsWith('.json')
    );

    if (!jsonFiles.length) {
      throw BadRequest('ZIP contains no .json files. Each JSON file should define an agent.');
    }

    for (const [name, entry] of jsonFiles) {
      try {
        const content = await entry.async('string');
        const parsed = JSON.parse(content);

        // Validate against agent create schema
        const validated = agentCreateSchema.parse(parsed);

        // Check for duplicate name
        const existing = await db.agent.findFirst({ where: { name: validated.name } });
        if (existing) {
          results.push({ name: validated.name, status: 'skipped', reason: 'Agent with this name already exists' });
          continue;
        }

        // Create agent (only fields that exist in Prisma schema)
        await db.agent.create({
          data: {
            name: validated.name,
            role: validated.role ?? '',
            roleGroup: validated.roleGroup ?? 'specialist',
            description: validated.description ?? '',
            systemPrompt: validated.systemPrompt ?? '',
            parentId: validated.parentId ?? null,
            status: validated.status ?? 'draft',
            tools: JSON.stringify(validated.tools ?? []),
            skills: JSON.stringify(validated.skills ?? []),
            standards: JSON.stringify(validated.standards ?? []),
          },
        });

        results.push({ name: validated.name, status: 'created' });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ name, status: 'error', reason: msg });
      }
    }

    const created_count = results.filter(r => r.status === 'created').length;
    const skipped_count = results.filter(r => r.status === 'skipped').length;
    const error_count = results.filter(r => r.status === 'error').length;

    return created({
      message: `Imported ${created_count} agent(s), skipped ${skipped_count}, errors ${error_count}`,
      results,
      summary: { created: created_count, skipped: skipped_count, errors: error_count },
    });
  } catch (error) {
    return handleError(error);
  }
}
