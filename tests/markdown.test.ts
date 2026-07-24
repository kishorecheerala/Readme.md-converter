import { calculateDocumentStats, extractTOC, parseSections } from '../src/lib/markdown/parser';

describe('Markdown Parser & Utility Suite', () => {
  const sampleMd = `# Main Title

## Section One
This is sample content for testing.

\`\`\`typescript
const x = 42;
\`\`\`

## Section Two
| Col 1 | Col 2 |
| --- | --- |
| Val 1 | Val 2 |

![Image Alt](https://example.com/image.png)
`;

  test('calculateDocumentStats extracts correct statistics', () => {
    const stats = calculateDocumentStats(sampleMd);
    expect(stats.headingsCount).toBe(3);
    expect(stats.codeBlocksCount).toBe(1);
    expect(stats.imagesCount).toBe(1);
    expect(stats.tablesCount).toBe(1);
    expect(stats.words).toBeGreaterThan(0);
  });

  test('extractTOC extracts correct heading items', () => {
    const toc = extractTOC(sampleMd);
    expect(toc).toHaveLength(3);
    expect(toc[0].text).toBe('Main Title');
    expect(toc[1].text).toBe('Section One');
    expect(toc[2].text).toBe('Section Two');
  });

  test('parseSections splits document into reorderable sections', () => {
    const sections = parseSections(sampleMd);
    expect(sections.length).toBeGreaterThanOrEqual(3);
    expect(sections[0].heading).toBe('Main Title');
  });
});
