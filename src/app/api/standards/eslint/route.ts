// ============================================================================
// GET /api/standards/eslint -- Export standards as ESLint-compatible config
// Generates a complete .eslintrc with plugins, rules from DB, and 3a plugin rules
// ============================================================================

import { handleError, success } from '@/lib/api-error';
import { db } from '@/lib/db';
import { buildEslintConfig } from './helpers';

interface StandardRule {
  id?: string;
  name: string;
  description?: string;
  pattern?: string;
  enabled?: boolean;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') ?? 'json';
    const includePlugin = url.searchParams.get('plugin') !== 'false';

    const standards = await db.standard.findMany({ orderBy: { category: 'asc' } });

    const dbRules: Record<string, string | [string, Record<string, unknown>]> = {};
    const categories: Record<string, string[]> = {};
    const patterns: Record<string, { pattern: string; description: string }> = {};

    for (const standard of standards) {
      const rules: StandardRule[] = JSON.parse(standard.rules);
      const cat = standard.category;
      if (!categories[cat]) categories[cat] = [];

      for (const rule of rules) {
        if (rule.enabled === false) continue;

        const ruleName = rule.id || rule.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const severity = standard.severity === 'error' ? 'error'
          : standard.severity === 'warning' ? 'warn' : 'warn';

        dbRules[ruleName] = severity;
        categories[cat].push(ruleName);

        if (rule.pattern) {
          patterns[ruleName] = { pattern: rule.pattern, description: rule.description || rule.name };
        }
      }
    }

    const config = buildEslintConfig({
      dbRules, categories, patterns, includePlugin,
    });

    if (format === 'yaml') {
      return yamlResponse(config);
    }

    return success(config);
  } catch (error) {
    return handleError(error);
  }
}

function yamlResponse(config: Record<string, unknown>): Response {
  const yaml = objectToYaml(config);
  return new Response(yaml, {
    headers: {
      "Content-Type": "text/yaml; charset=utf-8",
      "Content-Disposition": 'attachment; filename=".eslintrc.yml"',
    },
  });
}

/** Minimal YAML serializer for flat + one-level-nested objects */
function objectToYaml(obj: Record<string, unknown>, indent = 0): string {
  const pad = '  '.repeat(indent);
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      lines.push(`${pad}${key}:`);
      lines.push(objectToYaml(value as Record<string, unknown>, indent + 1));
    } else if (Array.isArray(value)) {
      lines.push(`${pad}${key}:`);
      for (const item of value) {
        lines.push(`${pad}  - ${JSON.stringify(item)}`);
      }
    } else {
      lines.push(`${pad}${key}: ${typeof value === 'string' ? `"${value}"` : value}`);
    }
  }
  return lines.join('\n');
}
