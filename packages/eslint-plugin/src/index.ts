// ============================================================================
// eslint-plugin-3a - Custom ESLint rules for 3A Studio
// ============================================================================

import type { Rule } from "eslint";

/**
 * Rule: max-lines
 * Enforces maximum lines per file (default: 150)
 * Based on anti-monolith pattern
 */
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
      tooLong: "File is too long ({{actual}} lines). Maximum allowed is {{max}}.",
    },
  },
  create(context) {
    const options = context.options[0] || {};
    const max = options.max || 150;
    const skipBlankLines = options.skipBlankLines || false;
    const skipComments = options.skipComments || false;

    return {
      Program(node) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const lines = sourceCode.lines;
        let lineCount = lines.length;

        if (skipBlankLines) {
          lineCount = lines.filter((line: string) => line.trim().length > 0).length;
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

/**
 * Rule: max-use-state
 * Enforces maximum useState hooks per component (default: 3)
 * Based on anti-monolith pattern
 */
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
      tooMany: "Too many useState hooks ({{actual}}). Maximum allowed is {{max}}. Consider using useReducer or a Zustand store.",
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

/**
 * Rule: no-cross-layer-import
 * Prevents imports across architectural layers
 * e.g., ui components importing from API routes
 */
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
      crossLayer: "Cross-layer import detected: '{{source}}' imports from '{{target}}'. Keep layers separate.",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') return;

        // Block: components importing from api routes
        const filePath = context.getFilename();
        const isComponent = filePath.includes("/components/") || filePath.includes("/app/");
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

/**
 * Rule: no-unicode-escapes
 * Prevents Unicode escape sequences in JSX
 * Use literal characters or <super>/<sub> tags instead
 */
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
      unicodeEscape: "Unicode escape '\\u{{hex}}' found. Use the literal character or HTML tags instead.",
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.raw === "string" && /\\u[0-9a-fA-F]{4}/.test(node.raw)) {
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

export default {
  rules: {
    "max-lines": maxLinesRule,
    "max-use-state": maxUseStateRule,
    "no-cross-layer": noCrossLayerRule,
    "no-unicode-escapes": noUnicodeRule,
  },
};
