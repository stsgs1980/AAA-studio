// ============================================================================
// eslint-plugin-3a - Custom ESLint rules for 3A Studio
// ============================================================================

import { maxLinesRule } from "./rules/max-lines.js";
import { maxUseStateRule } from "./rules/max-use-state.js";
import { noCrossLayerRule } from "./rules/no-cross-layer.js";
import { noUnicodeRule } from "./rules/no-unicode-escapes.js";
import { unicodePolicyRule } from "./rules/unicode-policy.js";

export { maxLinesRule, maxUseStateRule, noCrossLayerRule, noUnicodeRule, unicodePolicyRule };

export default {
  rules: {
    "max-lines": maxLinesRule,
    "max-use-state": maxUseStateRule,
    "no-cross-layer": noCrossLayerRule,
    "no-unicode-escapes": noUnicodeRule,
    "unicode-policy": unicodePolicyRule,
  },
};
