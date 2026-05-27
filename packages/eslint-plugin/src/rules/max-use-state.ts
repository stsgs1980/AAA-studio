// ============================================================================
// Rule: max-use-state
// Enforces maximum useState hooks per component (default: 3)
// ============================================================================

import type { Rule } from "eslint";

export const maxUseStateRule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce maximum useState hooks per component",
      category: "Best Practices",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "number", minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      tooMany:
        "Too many useState hooks ({{actual}}). Maximum allowed is {{max}}. " +
        "Consider using useReducer or a Zustand store.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const max = options.max || 3;

    return {
      VariableDeclaration(node) {
        const useStateCount = node.declarations.filter((decl) => {
          if (
            decl.init &&
            decl.init.type === "CallExpression" &&
            decl.init.callee.type === "Identifier" &&
            decl.init.callee.name === "useState"
          ) {
            return true;
          }
          return false;
        }).length;

        if (useStateCount > max) {
          context.report({
            node,
            messageId: "tooMany",
            data: { actual: useStateCount, max },
          });
        }
      },
    };
  },
};
