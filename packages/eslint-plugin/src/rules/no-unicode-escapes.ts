// ============================================================================
// Rule: no-unicode-escapes
// Prevents Unicode escape sequences in JSX
// ============================================================================

import type { Rule } from "eslint";

export const noUnicodeRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent Unicode escape sequences in code",
      category: "Code Quality",
      recommended: true,
    },
    schema: [],
    messages: {
      unicodeEscape:
        "Unicode escape '\\u{{hex}}' found. Use the literal character " +
        "or HTML tags instead.",
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (
          typeof node.raw === "string" &&
          /\\u[0-9a-fA-F]{4}/.test(node.raw)
        ) {
          const match = node.raw.match(/\\u([0-9a-fA-F]{4})/);
          if (match) {
            context.report({
              node,
              messageId: "unicodeEscape",
              data: { hex: match[1] },
            });
          }
        }
      },
    };
  },
};
