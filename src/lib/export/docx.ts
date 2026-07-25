import { CoverPageConfig, HeaderFooterConfig } from '@/types';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  Paragraph,
  PageNumber as PageNumberToken,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';

export interface DOCXExportOptions {
  markdown: string;
  title?: string;
  coverPage?: CoverPageConfig;
  headerFooter?: HeaderFooterConfig;
}

/**
 * Converts Markdown string into native Microsoft Word (.docx) Document file with tables, headings, and inline styling.
 */
export async function exportToDocx(options: DOCXExportOptions): Promise<Blob> {
  const { markdown, title = 'Document', coverPage, headerFooter } = options;

  const docChildren: (Paragraph | Table)[] = [];

  // Add Cover Page if enabled
  if (coverPage && coverPage.enabled) {
    docChildren.push(
      new Paragraph({
        text: coverPage.title || title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 1440, after: 720 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: coverPage.subtitle || '',
            italics: true,
            size: 28,
            color: '555555',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 1440 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Author: ${coverPage.author || 'N/A'}`,
            bold: true,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 280 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Date: ${coverPage.date || new Date().toLocaleDateString()}`,
            size: 22,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 280 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Version: ${coverPage.version || '1.0.0'}`,
            size: 22,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 2880 },
      })
    );
  }

  // Parse lines into native docx elements
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  let inTable = false;
  let tableBuffer: string[] = [];

  const flushTableBuffer = () => {
    if (tableBuffer.length === 0) return;

    // Filter out table separator rows (|---|---|)
    const rows = tableBuffer.filter(
      (r) => !r.trim().match(/^\|?(\s*:?-+:?\s*\|)+$/)
    );

    if (rows.length > 0) {
      const docxRows: TableRow[] = [];

      rows.forEach((rowStr, rowIndex) => {
        const cells = rowStr
          .trim()
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

        const isHeader = rowIndex === 0;

        const tableCells = cells.map(
          (cellText) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: parseFormattedText(cellText),
                  spacing: { before: 100, after: 100 },
                }),
              ],
              shading: isHeader ? { fill: 'F1F5F9' } : undefined,
              margins: { top: 120, bottom: 120, left: 150, right: 150 },
            })
        );

        docxRows.push(new TableRow({ children: tableCells }));
      });

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: docxRows,
        })
      );
    }

    tableBuffer = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check Table Lines
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableBuffer.push(line);
      continue;
    } else if (inTable) {
      flushTableBuffer();
    }

    // Handle Code Blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Close code block
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: codeBuffer.map(
                      (codeLine) =>
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: codeLine,
                              font: 'Courier New',
                              size: 19,
                              color: '1E293B',
                            }),
                          ],
                        })
                    ),
                    shading: { fill: 'F8FAFC' },
                    margins: { top: 200, bottom: 200, left: 200, right: 200 },
                  }),
                ],
              }),
            ],
          })
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Headings H1 to H6
    if (line.startsWith('# ')) {
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(line.replace('# ', '')),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (line.startsWith('## ')) {
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(line.replace('## ', '')),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (line.startsWith('### ')) {
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(line.replace('### ', '')),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (line.startsWith('#### ')) {
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(line.replace('#### ', '')),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 180, after: 90 },
        })
      );
    } else if (line.startsWith('##### ')) {
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(line.replace('##### ', '')),
          heading: HeadingLevel.HEADING_5,
          spacing: { before: 150, after: 80 },
        })
      );
    } else if (line.startsWith('###### ')) {
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(line.replace('###### ', '')),
          heading: HeadingLevel.HEADING_6,
          spacing: { before: 120, after: 60 },
        })
      );
    }
    // Bullet lists
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().substring(2);
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(text),
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
    // Blockquotes
    else if (line.trim().startsWith('> ')) {
      const text = line.trim().substring(2);
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(text),
          spacing: { before: 150, after: 150 },
          indent: { left: 360 },
        })
      );
    }
    // Horizontal Rule
    else if (line.trim() === '---' || line.trim() === '***') {
      docChildren.push(
        new Paragraph({
          border: { bottom: { color: 'CBD5E1', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          spacing: { before: 200, after: 200 },
        })
      );
    }
    // Standard Paragraph
    else if (line.trim().length > 0) {
      docChildren.push(
        new Paragraph({
          children: parseFormattedText(line),
          spacing: { after: 150 },
        })
      );
    }
  }

  // Flush any trailing table
  if (inTable) {
    flushTableBuffer();
  }

  // Create Header & Footer
  const docHeader =
    headerFooter?.enabledHeader ?
      new Header({
        children: [
          new Paragraph({
            text: headerFooter.headerLeft || title,
            alignment: AlignmentType.RIGHT,
          }),
        ],
      })
    : undefined;

  const docFooter =
    headerFooter?.enabledFooter ?
      new Footer({
        children: [
          new Paragraph({
            children: [
              new TextRun(headerFooter.footerLeft || 'Generated with ReadmeConverter'),
              new TextRun(' | Page '),
              new TextRun({ children: [PageNumberToken.CURRENT] }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      })
    : undefined;

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: docHeader ? { default: docHeader } : undefined,
        footers: docFooter ? { default: docFooter } : undefined,
        children: docChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Helper function to parse inline Markdown formatting (bold, italic, code, regex codes) into Word TextRun objects.
 */
function parseFormattedText(text: string): TextRun[] {
  if (!text) return [];
  const runs: TextRun[] = [];

  // Match bold (**text**), italic (*text*), inline code (`text`)
  const regex = /(\*\*.*?\*\*|\*.*?\*|`[^`]+`|[^\*`]+)/g;
  const matches = text.match(regex) || [text];

  matches.forEach((segment) => {
    if (segment.startsWith('**') && segment.endsWith('**') && segment.length > 4) {
      runs.push(
        new TextRun({
          text: segment.slice(2, -2),
          bold: true,
          size: 22,
        })
      );
    } else if (segment.startsWith('*') && segment.endsWith('*') && segment.length > 2) {
      runs.push(
        new TextRun({
          text: segment.slice(1, -1),
          italics: true,
          size: 22,
        })
      );
    } else if (segment.includes('`')) {
      // Remove any surrounding backticks cleanly
      const codeVal = segment.replace(/^`+/, '').replace(/`+$/, '');
      if (codeVal) {
        runs.push(
          new TextRun({
            text: codeVal,
            font: 'Courier New',
            size: 20,
            color: '0F172A',
          })
        );
      }
    } else {
      runs.push(
        new TextRun({
          text: segment,
          size: 22,
        })
      );
    }
  });

  return runs;
}
