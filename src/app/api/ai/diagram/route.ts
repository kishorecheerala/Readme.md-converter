import { generateMermaidDiagram } from '@/lib/ai/diagram';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt = 'Architecture Overview', type = 'flowchart' } = body;

    const diagramMarkdown = generateMermaidDiagram(prompt, type);
    return NextResponse.json({ success: true, diagram: diagramMarkdown });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Diagram generation failed' }, { status: 500 });
  }
}
