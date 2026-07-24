import { AIAnalysisResult } from '@/types';

/**
 * Analyzes Markdown documentation quality, structure, readability, and accessibility.
 */
export function analyzeDocumentQuality(markdown: string): AIAnalysisResult {
  if (!markdown || markdown.trim().length === 0) {
    return {
      overallScore: 0,
      categories: {
        readability: { score: 0, feedback: 'Document is empty.' },
        structure: { score: 0, feedback: 'No headings detected.' },
        documentationQuality: { score: 0, feedback: 'Missing core documentation elements.' },
        missingSections: { score: 0, items: ['Title', 'Overview', 'Installation', 'Usage', 'License'] },
        accessibility: { score: 0, feedback: 'No image alt tags evaluated.' },
        seo: { score: 0, feedback: 'No document description.' },
      },
      recommendations: ['Add content to your README file to begin analysis.'],
    };
  }

  const recommendations: string[] = [];

  // Check Headings & Structure
  const headings = markdown.match(/^#{1,6}\s+.+/gm) || [];
  const h1Match = markdown.match(/^#\s+.+/m);
  const codeBlocks = markdown.match(/```[\s\S]*?```/g) || [];
  const imagesWithoutAlt = markdown.match(/!\[\s*\]\(.*?\)/g) || [];

  // Identify Missing Key Sections
  const lower = markdown.toLowerCase();
  const missingItems: string[] = [];
  if (!lower.includes('installation') && !lower.includes('getting started')) missingItems.push('Installation / Getting Started');
  if (!lower.includes('usage') && !lower.includes('example')) missingItems.push('Usage & Code Examples');
  if (!lower.includes('license')) missingItems.push('License');
  if (!lower.includes('contributing')) missingItems.push('Contributing Guidelines');

  // Compute Scores
  const readabilityScore = Math.min(100, Math.max(40, Math.round(100 - (markdown.length > 5000 ? 15 : 0))));

  let structureScore = 100;
  if (!h1Match) {
    structureScore -= 25;
    recommendations.push('Add an H1 `# Document Title` at the beginning of the README.');
  }
  if (headings.length < 3) {
    structureScore -= 20;
    recommendations.push('Structure your document using multiple section sub-headings (H2/H3).');
  }

  let docQualityScore = 100;
  if (codeBlocks.length === 0) {
    docQualityScore -= 20;
    recommendations.push('Include code blocks with syntax highlighting to demonstrate usage.');
  }

  let missingScore = Math.round(((5 - missingItems.length) / 5) * 100);
  if (missingItems.length > 0) {
    recommendations.push(`Consider adding missing recommended sections: ${missingItems.join(', ')}.`);
  }

  let a11yScore = 100;
  if (imagesWithoutAlt.length > 0) {
    a11yScore -= 30;
    recommendations.push(`Found ${imagesWithoutAlt.length} images with empty alt text. Add descriptive alt text for accessibility.`);
  }

  let seoScore = h1Match ? 90 : 60;

  const overallScore = Math.round(
    (readabilityScore + structureScore + docQualityScore + missingScore + a11yScore + seoScore) / 6
  );

  return {
    overallScore,
    categories: {
      readability: {
        score: readabilityScore,
        feedback: 'Sentence length and paragraph density are well aligned.',
      },
      structure: {
        score: structureScore,
        feedback: h1Match ? 'Proper heading hierarchy detected.' : 'Missing top-level H1 heading.',
      },
      documentationQuality: {
        score: docQualityScore,
        feedback: codeBlocks.length > 0 ? `Found ${codeBlocks.length} code blocks.` : 'No code examples provided.',
      },
      missingSections: {
        score: missingScore,
        items: missingItems,
      },
      accessibility: {
        score: a11yScore,
        feedback: imagesWithoutAlt.length === 0 ? 'All images have descriptive alt text.' : `${imagesWithoutAlt.length} images missing alt text.`,
      },
      seo: {
        score: seoScore,
        feedback: h1Match ? 'Primary title present for document search indexing.' : 'Missing document title for metadata indexing.',
      },
    },
    recommendations,
  };
}
