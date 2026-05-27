// ============================================================================
// Rule: max-lines
// Enforces maximum lines per file (default: 150)
// ============================================================================

import type { Rule } from "eslint";

export const maxLinesRule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce maximum lines per file",
      category: "Stylistic Issues",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "number", minimum: 1 },
          skipBlankLines: { type: "boolean" },
          skipComments: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooLong:
        "File is too long ({{actual}} lines). Maximum allowed is {{max}}.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const max = options.max || 150;
    const skipBlankLines = options.skipBlankLines || false;

    return {
      Program(node) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const lines = sourceCode.lines;
        let lineCount = lines.length;

        if (skipBlankLines) {
          lineCount = lines.filter(
            (line: string) => line.trim().length > 0
          ).length;
        }

        if (lineCount > max) {
          context.report({
            node,
            messageId: "tooLong",
            data: { actual: lineCount, max },
          });
        }
      },
    };
  },
};
