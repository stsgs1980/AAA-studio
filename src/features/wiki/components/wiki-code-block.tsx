"use client";

import { CodeBlock, type CodeBlockProps } from "@/components/code-block";

/**
 * WikiCodeBlock is a thin re-export of shared CodeBlock.
 * Kept for backward compatibility — all wiki pages import from here.
 */
export function WikiCodeBlock(props: CodeBlockProps) {
  return <CodeBlock {...props} />;
}
