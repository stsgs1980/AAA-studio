import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import plugin3a from "./packages/eslint-plugin/dist/index.js";

const eslintConfig = [
  { ignores: ["next-env.d.ts", "tools/verify-docs/**", "verify-docs.plugins.ts"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "3a": plugin3a,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      // Anti-monolith rules
      "3a/max-lines": ["error", { max: 150 }],
      "3a/max-use-state": ["error", { max: 3 }],
      "3a/no-cross-layer": "error",
      "3a/no-unicode-escapes": "error",
      "3a/unicode-policy": "error",
    },
  },
  {
    files: ["packages/**/*.ts", "packages/**/*.tsx", "scripts/**/*.ts", "prisma/**/*.ts"],
    rules: {
      "3a/max-lines": "off",
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "3a/unicode-policy": "off",
    },
  },
];

export default eslintConfig;
