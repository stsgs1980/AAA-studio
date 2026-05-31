// ============================================================================
// GET /api/standards/eslint -- Export standards as ESLint-compatible JSON config
// Converts Standard records with rules into an ESLint rules configuration object.
// ============================================================================

import { handleError, success } from '@/lib/api-error';
import { db } from '@/lib/db';

interface StandardRule {
  id?: string;
  name: string;
  description?: string;
  pattern?: string;
  severity?: 'off' | 'warn' | 'error';
  options?: Record<string, unknown>;
}

export async function GET() {
  try {
    const standards = await db.standard.findMany({ orderBy: { category: 'asc' } });
    const eslintRules: Record<string, string | [string, Record<string, unknown>]> = {};
    const categories: Record<string, string[]> = {};

    for (const standard of standards) {
      const rules: StandardRule[] = JSON.parse(standard.rules);
      const cat = standard.category;
      if (!categories[cat]) categories[cat] = [];

      for (const rule of rules) {
        const ruleName = rule.id || rule.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const severity = standard.severity === 'error' ? 'error'
          : standard.severity === 'warning' ? 'warn' : (rule.severity || 'warn');
        eslintRules[ruleName] = rule.options && Object.keys(rule.options).length > 0
          ? [severity, rule.options] : severity;
        categories[cat].push(ruleName);
      }
    }

    return success({
      $schema: 'https://json.schemastore.org/eslintrc',
      rules: eslintRules,
      _meta: {
        generatedAt: new Date().toISOString(),
        totalRules: Object.keys(eslintRules).length,
        categories,
        source: '3a-studio-standards',
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
