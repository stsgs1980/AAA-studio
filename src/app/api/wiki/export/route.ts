// ============================================================================
// GET /api/wiki/export -- Export wiki pages as markdown for GitHub sync
// Generates a markdown file per wiki page, suitable for GitHub Wiki or docs.
// ============================================================================

import { success, handleError } from '@/lib/api-error';
import { wikiNavItems, wikiCategories } from '@/features/wiki/data/wiki-nav-data';

export async function GET() {
  try {
    const pages: Record<string, string> = {};

    for (const item of wikiNavItems) {
      const related = wikiNavItems.filter(i => i.category === item.category && i.id !== item.id);
      pages[`${item.id}.md`] = [
        `# ${item.title}`, '',
        `> Category: ${item.category}`,
        `> Keywords: ${item.keywords.join(', ')}`, '',
        `Documentation for ${item.title} in 3A Studio.`,
        `Visit /wiki/${item.id} for the interactive version.`, '',
        '## Related Pages', '',
        ...related.map(i => `- [${i.title}](./${i.id})`), '',
      ].join('\n');
    }

    pages['Home.md'] = [
      '# 3A Studio Wiki', '',
      '> Artificial. Agentic. Architecture.', '',
      '## Table of Contents', '',
      ...wikiCategories.map(cat => {
        const items = wikiNavItems.filter(i => i.category === cat);
        return [`### ${cat}`, '', ...items.map(i => `- [${i.title}](./${i.id})`), ''].join('\n');
      }),
      '---',
      `Generated on ${new Date().toISOString()}`,
    ].join('\n');

    return success({ format: 'github-wiki', pageCount: Object.keys(pages).length, pages });
  } catch (error) {
    return handleError(error);
  }
}
