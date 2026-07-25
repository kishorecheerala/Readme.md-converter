import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const STIRLING_DEFAULT_URL = 'https://stirling-pdf-latest-9j5e.onrender.com';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const action = req.nextUrl.searchParams.get('action') || 'rearrange-pages';

    const stirlingBase = process.env.NEXT_PUBLIC_STIRLING_PDF_URL || STIRLING_DEFAULT_URL;
    const stirlingUrl = `${stirlingBase.replace(/\/$/, '')}/api/v1/general/${action}`;

    const res = await fetch(stirlingUrl, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Stirling API Error (${res.status}):`, errorText);
      return NextResponse.json(
        { error: 'Stirling PDF processing failed', details: errorText },
        { status: res.status }
      );
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document-processed.pdf"',
      },
    });
  } catch (error: any) {
    console.error('Stirling Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Stirling PDF service', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
