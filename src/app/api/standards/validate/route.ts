// ============================================================================
// POST /api/standards/validate -- Validate code against standards rules
// Runs regex patterns stored in Standard.rules[].pattern against submitted code
// Returns pass/fail per rule with optional standardIds filter
// ============================================================================

import { handleError, success } from '@/lib/api-error';
import { db } from '@/lib/db';
import { z } from 'zod';

interface StandardRule {
  id?: string;
  name: string;
  description?: string;
  pattern?: string;
  enabled?: boolean;
}

interface ValidationResult {
  standardId: string;
  standardName: string;
  ruleId: string;
  ruleName: string;
  passed: boolean;
  message: string;
  match?: string;
}

const validateSchema = z.object({
  code: z.string().min(1, "Code is required"),
  language: z.string().optional(),
  standardIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { code, standardIds } = parsed.data;

    // Fetch standards -- filter by IDs if provided, otherwise all
    const where = standardIds?.length
      ? { id: { in: standardIds } }
      : {};
    const standards = await db.standard.findMany({ where, orderBy: { category: 'asc' } });

    const results: ValidationResult[] = [];

    for (const standard of standards) {
      let rules: StandardRule[];
      try {
        rules = JSON.parse(standard.rules);
      } catch {
        continue;
      }

      for (const rule of rules) {
        // Skip disabled rules or rules without pattern
        if (rule.enabled === false) continue;
        if (!rule.pattern) continue;

        try {
          const regex = new RegExp(rule.pattern, 'm');
          const match = regex.exec(code);
          const passed = match === null;

          results.push({
            standardId: standard.id,
            standardName: standard.name,
            ruleId: rule.id || rule.name.toLowerCase().replace(/\s+/g, '-'),
            ruleName: rule.name,
            passed,
            message: passed
              ? `Passes: ${rule.name}`
              : `Violates: ${rule.name}`,
            match: match ? match[0] : undefined,
          });
        } catch {
          // Invalid regex pattern -- skip this rule gracefully
          results.push({
            standardId: standard.id,
            standardName: standard.name,
            ruleId: rule.id || rule.name.toLowerCase().replace(/\s+/g, '-'),
            ruleName: rule.name,
            passed: true,
            message: `Skipped: invalid pattern for "${rule.name}"`,
          });
        }
      }
    }

    const summary = {
      totalRules: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      standardsChecked: standards.length,
    };

    return success({ summary, results });
  } catch (error) {
    return handleError(error);
  }
}
