import { THEMES } from '@/lib/constants/themes';
import { buildStandaloneHtml } from '@/lib/export/html';
import { parseMarkdownToHtml } from '@/lib/markdown/parser';
import { ThemeId } from '@/types';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      markdown,
      title = 'Document',
      themeId = 'classic',
      pageSize = 'a4',
      orientation = 'portrait',
      customCss = '',
    } = body;

    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    // 1. Render Markdown to HTML
    const renderedHtml = await parseMarkdownToHtml(markdown);
    const theme = THEMES[themeId as ThemeId] || THEMES.classic;

    // 2. Build Standalone HTML document with vector print styles
    const fullHtml = buildStandaloneHtml({
      title,
      renderedHtml,
      theme,
      customCss: `
        @media print {
          @page {
            size: ${pageSize} ${orientation};
            margin: 15mm;
          }
          body {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          h1, h2, h3, h4, p, li, tr, pre, blockquote, img, .mermaid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
        ${customCss}
      `,
    });

    // 3. Launch Headless Chromium Engine (Stirling-PDF style)
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
      ],
    });

    const page = await browser.newPage();

    // Set page HTML content
    await page.setContent(fullHtml, {
      waitUntil: ['load', 'domcontentloaded'],
    });

    // Generate Vector PDF Document
    const pdfBuffer = await page.pdf({
      format: pageSize as any,
      landscape: orientation === 'landscape',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm',
      },
    });

    await browser.close();

    // 4. Return PDF File Binary Buffer
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('API PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'PDF conversion failed', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
