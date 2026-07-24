import { exportToDocx } from '@/lib/export/docx';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { markdown, title, coverPage, headerFooter } = body;

    if (!markdown) {
      return NextResponse.json({ error: 'Markdown content is required' }, { status: 400 });
    }

    const docxBlob = await exportToDocx({ markdown, title, coverPage, headerFooter });
    const buffer = Buffer.from(await docxBlob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title || 'document'}.docx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'DOCX conversion failed' }, { status: 500 });
  }
}
