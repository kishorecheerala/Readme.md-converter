import { analyzeDocumentQuality } from '@/lib/ai/analyzer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { markdown } = body;

    if (markdown === undefined) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const analysis = analyzeDocumentQuality(markdown);
    return NextResponse.json({ success: true, analysis });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
