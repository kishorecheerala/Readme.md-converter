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
  PageOrientation,
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
 * Converts Markdown string into native Microsoft Word (.docx) Document file.
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

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
                    shading: { fill: 'F1F5F9' },
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

    // Headings
    if (line.startsWith('# ')) {
      docChildren.push(
        new Paragraph({
          text: line.replace('# ', '').replace(/[*_`]/g, ''),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        })
      );
    } else if (line.startsWith('## ')) {
      docChildren.push(
        new Paragraph({
          text: line.replace('## ', '').replace(/[*_`]/g, ''),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (line.startsWith('### ')) {
      docChildren.push(
        new Paragraph({
          text: line.replace('### ', '').replace(/[*_`]/g, ''),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        })
      );
    }
    // Bullet lists
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const text = line.trim().substring(2).replace(/[*_`]/g, '');
      docChildren.push(
        new Paragraph({
          text: text,
          bullet: { level: 0 },
          spacing: { after: 100 },
        })
      );
    }
    // Blockquotes
    else if (line.trim().startsWith('> ')) {
      const text = line.trim().substring(2).replace(/[*_`]/g, '');
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: text,
              italics: true,
              color: '3B82F6',
            }),
          ],
          spacing: { before: 150, after: 150 },
          indent: { left: 360 },
        })
      );
    }
    // Standard Paragraph
    else if (line.trim().length > 0) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.replace(/[*_`]/g, ''),
              size: 22,
            }),
          ],
          spacing: { after: 150 },
        })
      );
    }
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
