// ============================================================================
// Rule: no-cross-layer-import
// Prevents imports across architectural layers
// ============================================================================

import type { Rule } from "eslint";

export const noCrossLayerRule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent cross-layer imports",
      category: "Architecture",
      recommended: true,
    },
    schema: [],
    messages: {
      crossLayer:
        "Cross-layer import detected: '{{source}}' imports from '{{target}}'. " +
        "Keep layers separate.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== "string") return;

        const filePath = context.getFilename();
        const isComponent =
          filePath.includes("/components/") || filePath.includes("/app/");
        const isApiImport = source.startsWith("@/app/api/");

        if (isComponent && isApiImport) {
          context.report({
            node,
            messageId: "crossLayer",
            data: { source: filePath, target: source },
          });
        }
      },
    };
  },
};
