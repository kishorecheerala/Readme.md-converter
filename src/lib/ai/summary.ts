export interface SummaryResult {
  executiveSummary: string;
  tldr: string;
  keyPoints: string[];
}

/**
 * Generates an executive summary and TL;DR from Markdown text.
 */
export function generateDocumentSummary(markdown: string): SummaryResult {
  if (!markdown) {
    return {
      executiveSummary: 'No content available.',
      tldr: 'Empty document.',
      keyPoints: [],
    };
  }

  const headings = (markdown.match(/^#{1,3}\s+(.+)$/gm) || []).map((h) =>
    h.replace(/^#{1,3}\s+/, '').trim()
  );

  const cleanText = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/[#*`_~]/g, '')
    .trim();

  const paragraphs = cleanText
    .split(/\n\s*\n/)
    .filter((p) => p.length > 30);

  const firstParagraph = paragraphs[0] || 'This document provides comprehensive technical documentation.';

  const tldr =
    headings.length > 0 ?
      `Key documentation covering ${headings.slice(0, 3).join(', ')}.`
    : `${firstParagraph.slice(0, 140)}...`;

  const keyPoints = headings.slice(0, 5).map((h) => `Provides detailed specifications for ${h}.`);

  return {
    executiveSummary: `${firstParagraph} The document is structured into ${headings.length} core sections designed for fast onboarding and operational clarity.`,
    tldr,
    keyPoints,
  };
}
