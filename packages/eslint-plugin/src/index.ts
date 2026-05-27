// ============================================================================
// eslint-plugin-3a - Custom ESLint rules for 3A Studio
// ============================================================================

import { maxLinesRule } from "./rules/max-lines";
import { maxUseStateRule } from "./rules/max-use-state";
import { noCrossLayerRule } from "./rules/no-cross-layer";
import { noUnicodeRule } from "./rules/no-unicode-escapes";

export { maxLinesRule, maxUseStateRule, noCrossLayerRule, noUnicodeRule };

export default {
  rules: {
    "max-lines": maxLinesRule,
    "max-use-state": maxUseStateRule,
    "no-cross-layer": noCrossLayerRule,
    "no-unicode-escapes": noUnicodeRule,
  },
};
