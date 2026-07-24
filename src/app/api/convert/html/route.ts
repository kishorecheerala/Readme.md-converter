import { THEMES } from '@/lib/constants/themes';
import { buildStandaloneHtml } from '@/lib/export/html';
import { parseMarkdownToHtml } from '@/lib/markdown/parser';
import { ThemeId } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { markdown, title = 'Document', themeId = 'classic', customCss = '' } = body;

    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const renderedHtml = await parseMarkdownToHtml(markdown);
    const theme = THEMES[themeId as ThemeId] || THEMES.classic;
    const fullHtml = buildStandaloneHtml({ title, renderedHtml, theme, customCss });

    return new NextResponse(fullHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${title}.html"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'HTML conversion failed' }, { status: 500 });
  }
}
