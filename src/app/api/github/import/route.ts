import { fetchGitHubRepoDetails } from '@/lib/github/fetcher';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    const data = await fetchGitHubRepoDetails(url);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch GitHub repository' },
      { status: 500 }
    );
  }
}
