import { THEMES } from '@/lib/constants/themes';
import { buildStandaloneHtml } from '@/lib/export/html';
import { parseMarkdownToHtml } from '@/lib/markdown/parser';
import { ThemeId } from '@/types';
import chromium from '@sparticuz/chromium';
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s Vercel serverless limit

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      markdown,
      renderedHtmlDirect,
      title = 'Document',
      themeId = 'classic',
      pageSize = 'a4',
      orientation = 'portrait',
      customCss = '',
    } = body;

    if (!markdown && !renderedHtmlDirect) {
      return NextResponse.json({ error: 'Markdown or HTML content is required' }, { status: 400 });
    }

    // 1. Render Markdown to HTML (or use pre-rendered HTML from editor)
    const renderedHtml = renderedHtmlDirect || await parseMarkdownToHtml(markdown);
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
          .pdf-page-break {
            break-before: page !important;
            page-break-before: always !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: none !important;
          }
          .pdf-page-break-label { display: none !important; }
        }
        .pdf-page-break-label { display: none; }
        ${customCss}
      `,
    });

    // 3. Configure Sparticuz Chromium for AWS Lambda / Vercel Serverless
    const isVercel = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

    let executablePath: string;
    if (isVercel) {
      // Use Sparticuz remote tarball if local binary not bundled
      executablePath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar'
      );
    } else {
      executablePath =
        process.platform === 'win32'
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
          : process.platform === 'darwin'
          ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          : '/usr/bin/google-chrome';
    }

    const browser = await puppeteer.launch({
      args: isVercel ? chromium.args : ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1200, height: 800 },
      executablePath,
      headless: true,
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
