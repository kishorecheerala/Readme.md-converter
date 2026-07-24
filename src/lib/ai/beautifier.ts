/**
 * AI Beautifier algorithm to clean up markdown hierarchy, spacing, badges, and code blocks.
 */
export function beautifyMarkdown(markdown: string): string {
  if (!markdown) return '';

  let lines = markdown.split('\n');
  let result: string[] = [];

  let previousWasHeading = false;
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Clean up heading trailing/leading whitespace
    if (line.trim().startsWith('#')) {
      // Ensure space after '#'
      line = line.replace(/^(#{1,6})([^\s#])/, '$1 $2');

      // Add extra blank line before heading if missing
      if (result.length > 0 && result[result.length - 1].trim() !== '') {
        result.push('');
      }
      result.push(line.trim());
      result.push('');
      previousWasHeading = true;
      continue;
    }

    // Clean up list item spacing
    if (line.trim().match(/^[-*+]\s+/)) {
      result.push(line.trim());
      previousWasHeading = false;
      continue;
    }

    // Horizontal rule formatting
    if (line.trim().match(/^(---|\*\*\*|___)$/)) {
      if (result.length > 0 && result[result.length - 1].trim() !== '') {
        result.push('');
      }
      result.push('---');
      result.push('');
      previousWasHeading = false;
      continue;
    }

    // Standard paragraph line
    if (previousWasHeading && line.trim() === '') {
      continue; // avoid duplicate blank lines after heading
    }

    result.push(line);
    previousWasHeading = false;
  }

  return result.join('\n').replace(/\n{3,}/g, '\n\n');
}
