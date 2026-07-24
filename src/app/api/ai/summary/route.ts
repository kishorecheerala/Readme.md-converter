import { generateDocumentSummary } from '@/lib/ai/summary';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { markdown } = body;

    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const summary = generateDocumentSummary(markdown);
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Summary generation failed' }, { status: 500 });
  }
}
