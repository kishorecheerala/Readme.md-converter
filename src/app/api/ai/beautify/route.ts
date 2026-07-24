import { beautifyMarkdown } from '@/lib/ai/beautifier';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { markdown } = body;

    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const beautified = beautifyMarkdown(markdown);
    return NextResponse.json({ success: true, markdown: beautified });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Beautify failed' }, { status: 500 });
  }
}
