import { DocumentStats, SectionItem, TOCItem } from '@/types';

/**
 * Converts Markdown string into styled HTML with syntax highlighting & KaTeX math support.
 * Uses dynamic ESM imports for seamless compatibility with Next.js App Router and Jest.
 */
export async function parseMarkdownToHtml(markdown: string): Promise<string> {
  if (!markdown) return '';

  try {
    const { unified } = await import('unified');
    const { default: parse } = await import('remark-parse');
    const { default: gfm } = await import('remark-gfm');
    const { default: math } = await import('remark-math');
    const { default: remarkRehype } = await import('remark-rehype');
    const { default: rehypeKatex } = await import('rehype-katex');
    const { default: highlight } = await import('rehype-highlight');
    const { default: stringify } = await import('rehype-stringify');

    const file = await unified()
      .use(parse)
      .use(gfm)
      .use(math)
      .use(remarkRehype)
      .use(rehypeKatex)
      .use(highlight, { ignoreMissing: true } as any)
      .use(stringify)
      .process(markdown);

    let html = String(file);

    // Inject heading IDs for TOC navigation
    html = injectHeadingIds(html);

    return html;
  } catch (error) {
    console.error('Error parsing markdown to HTML:', error);
    return `<div class="error-box p-4 bg-red-50 text-red-700 rounded-lg">Error parsing markdown document: ${String(error)}</div>`;
  }
}

/**
 * Injects unique IDs into <h1>-<h6> tags for TOC anchors.
 */
function injectHeadingIds(html: string): string {
  let counter = 0;
  return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    counter++;
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    const slug = cleanText
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-') || `heading-${counter}`;

    return `<h${level}${attrs} id="${slug}">${text}</h${level}>`;
  });
}

/**
 * Extracts Table of Contents items from Markdown.
 */
export function extractTOC(markdown: string): TOCItem[] {
  const headings: TOCItem[] = [];
  const lines = markdown.split('\n');

  let idCounter = 0;
  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      idCounter++;
      const level = match[1].length;
      const text = match[2].replace(/[*_~`]/g, '').trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-') || `heading-${idCounter}`;

      headings.push({ id, text, level });
    }
  });

  return headings;
}

/**
 * Computes metrics and statistics for the document.
 */
export function calculateDocumentStats(markdown: string): DocumentStats {
  if (!markdown) {
    return {
      words: 0,
      characters: 0,
      readingTimeMinutes: 0,
      headingsCount: 0,
      codeBlocksCount: 0,
      tablesCount: 0,
      imagesCount: 0,
    };
  }

  const plainText = markdown
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[.*?\]\(.*?\)/g, '$1') // link text
    .replace(/[#*`_~|-]/g, ' ')
    .trim();

  const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
  const characters = markdown.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  const headingsCount = (markdown.match(/^#{1,6}\s+/gm) || []).length;
  const codeBlocksCount = (markdown.match(/```[\s\S]*?```/g) || []).length;
  const tablesCount = (markdown.match(/(\|[^\n]+\|\r?\n){2,}/g) || []).length;
  const imagesCount = (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length;

  return {
    words,
    characters,
    readingTimeMinutes,
    headingsCount,
    codeBlocksCount,
    tablesCount,
    imagesCount,
  };
}

/**
 * Splits document by H1/H2 headings to allow section reordering.
 */
export function parseSections(markdown: string): SectionItem[] {
  const lines = markdown.split('\n');
  const sections: SectionItem[] = [];

  let currentHeading = 'Overview';
  let currentLevel = 1;
  let currentContent: string[] = [];
  let sectionIndex = 0;

  lines.forEach((line) => {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      if (currentContent.length > 0 && (sectionIndex > 0 || currentContent.some((l) => l.trim().length > 0))) {
        sectionIndex++;
        sections.push({
          id: `sec-${sectionIndex}`,
          heading: currentHeading,
          level: currentLevel,
          content: currentContent.join('\n'),
        });
      }
      currentLevel = headingMatch[1].length;
      currentHeading = headingMatch[2].replace(/[*_~`]/g, '').trim();
      currentContent = [line];
    } else {
      currentContent.push(line);
    }
  });

  if (currentContent.length > 0 && currentContent.some((l) => l.trim().length > 0)) {
    sectionIndex++;
    sections.push({
      id: `sec-${sectionIndex}`,
      heading: currentHeading,
      level: currentLevel,
      content: currentContent.join('\n'),
    });
  }

  return sections;
}
