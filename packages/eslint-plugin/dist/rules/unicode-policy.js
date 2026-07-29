// ============================================================================
// Rule: unicode-policy
// Enforces STD-DOC-003 Unicode Policy v2.3
// Blocks emoji and Unicode graphics in string literals (level [C] Critical)
// ============================================================================
// Level [C] Emoji: supplemental plane characters
// U+1F300-U+1F9FF: Emoticons, Symbols, Transport, Flags, etc.
// U+2600-U+27BF: Misc Symbols + Dingbats (used as emoji on most platforms)
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}]/u;
// Level [C] Unicode graphics: box drawing, block elements, geometric shapes, arrows
// Used as decoration in code/JSX — should be replaced with ASCII or SVG icons
const GRAPHIC_RE = /[\u{2500}-\u{257F}\u{2580}-\u{259F}\u{25A0}-\u{25FF}\u{2190}-\u{21FF}]/u;
export const unicodePolicyRule = {
    meta: {
        type: "problem",
        docs: {
            description: "Enforce STD-DOC-003: block emoji and Unicode graphics in string literals",
            category: "Code Quality",
            recommended: true,
        },
        schema: [
            {
                type: "object",
                properties: {
                    emoji: { type: "boolean" },
                    graphics: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            emoji: "Emoji '{{char}}' (U+{{hex}}) in string. Use text or lucide-react SVG icons instead. (STD-DOC-003)",
            graphic: "Unicode graphic '{{char}}' (U+{{hex}}) in string. Use ASCII (->, [WARNING]) or lucide-react SVG icons. (STD-DOC-003)",
        },
    },
    create(context) {
        const options = context.options[0] || {};
        const checkEmoji = options.emoji !== false;
        const checkGraphics = options.graphics !== false;
        if (!checkEmoji && !checkGraphics)
            return {};
        function scan(node, text) {
            if (!text || text.length < 2)
                return;
            for (let i = 0; i < text.length;) {
                const cp = text.codePointAt(i);
                // Fast skip: ASCII (covers ~99% of source)
                if (cp < 0x80) {
                    i++;
                    continue;
                }
                // Skip surrogate halves (handled by codePointAt)
                if (cp >= 0xd800 && cp <= 0xdfff) {
                    i++;
                    continue;
                }
                const hex = cp.toString(16).toUpperCase().padStart(4, "0");
                const display = cp > 0xffff ? text.slice(i, i + 2) : String.fromCodePoint(cp);
                const step = cp > 0xffff ? 2 : 1;
                if (checkEmoji && EMOJI_RE.test(display)) {
                    context.report({ node, messageId: "emoji", data: { char: display, hex } });
                    i += step;
                    continue;
                }
                if (checkGraphics && GRAPHIC_RE.test(display)) {
                    context.report({ node, messageId: "graphic", data: { char: display, hex } });
                    i += step;
                    continue;
                }
                i += step;
            }
        }
        return {
            Literal(node) {
                if (typeof node.value === "string")
                    scan(node, node.value);
            },
            TemplateElement(node) {
                if (node.value && typeof node.value.raw === "string") {
                    scan(node, node.value.raw);
                }
            },
            JSXText(node) {
                if (typeof node.value === "string")
                    scan(node, node.value);
            },
        };
    },
};
