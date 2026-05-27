// ============================================================================
// eslint-plugin-3a - Custom ESLint rules for 3A Studio
// ============================================================================

import { maxLinesRule } from "./rules/max-lines.ts";
import { maxUseStateRule } from "./rules/max-use-state.ts";
import { noCrossLayerRule } from "./rules/no-cross-layer.ts";
import { noUnicodeRule } from "./rules/no-unicode-escapes.ts";

export { maxLinesRule, maxUseStateRule, noCrossLayerRule, noUnicodeRule };

export default {
  rules: {
    "max-lines": maxLinesRule,
    "max-use-state": maxUseStateRule,
    "no-cross-layer": noCrossLayerRule,
    "no-unicode-escapes": noUnicodeRule,
  },
};
