import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import plugin3a from "./packages/eslint-plugin/src/index.ts";

const eslintConfig = [
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
    },
  },
];

export default eslintConfig;
