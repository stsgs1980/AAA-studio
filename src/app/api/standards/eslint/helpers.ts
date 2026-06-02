/** Build a complete ESLint config from DB rules + eslint-plugin-3a */

interface BuildConfigInput {
  dbRules: Record<string, string | [string, Record<string, unknown>]>;
  categories: Record<string, string[]>;
  patterns: Record<string, { pattern: string; description: string }>;
  includePlugin: boolean;
}

export function buildEslintConfig(input: BuildConfigInput): Record<string, unknown> {
  const { dbRules, categories, patterns, includePlugin } = input;

  // 3a plugin rules (always available, mapped from the actual plugin)
  const plugin3aRules: Record<string, string | [string, Record<string, unknown>]> = {
    "3a/max-lines": ["warn", { max: 150, skipBlankLines: false }],
    "3a/max-use-state": ["warn", { max: 3 }],
    "3a/no-cross-layer": "error",
    "3a/no-unicode-escapes": "error",
  };

  const allRules: Record<string, unknown> = {
    ...dbRules,
    ...(includePlugin ? plugin3aRules : {}),
  };

  const config: Record<string, unknown> = {
    $schema: "https://json.schemastore.org/eslintrc",
    env: { browser: true, node: true, es2022: true },
    parser: "@typescript-eslint/parser",
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      ecmaFeatures: { jsx: true },
    },
    settings: {
      react: { version: "detect" },
    },
    rules: allRules,
  };

  // Include 3a plugin if requested
  if (includePlugin) {
    config.plugins = ["3a"];
  }

  // Metadata
  config._meta = {
    generatedAt: new Date().toISOString(),
    totalRules: Object.keys(allRules).length,
    dbRulesCount: Object.keys(dbRules).length,
    pluginRulesCount: includePlugin ? Object.keys(plugin3aRules).length : 0,
    categories,
    patterns,
    source: "3a-studio-standards",
    description: "Auto-generated ESLint config from 3A Studio Standards Manager",
  };

  return config;
}
