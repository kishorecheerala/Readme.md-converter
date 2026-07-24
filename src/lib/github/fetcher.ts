import { GitHubRepoMetadata } from '@/types';

/**
 * Extracts owner and repo name from GitHub URL or 'owner/repo' string.
 */
export function parseGitHubUrl(inputUrl: string): { owner: string; repo: string } | null {
  if (!inputUrl) return null;

  const trimmed = inputUrl.trim().replace(/\/$/, '');

  // Match github.com/owner/repo
  const urlMatch = trimmed.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/i, '') };
  }

  // Match owner/repo pattern
  const shortMatch = trimmed.match(/^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/);
  if (shortMatch) {
    return { owner: shortMatch[1], repo: shortMatch[2].replace(/\.git$/i, '') };
  }

  return null;
}

/**
 * Fetches repository README and metadata from GitHub REST API.
 */
export async function fetchGitHubRepoDetails(inputUrl: string): Promise<GitHubRepoMetadata> {
  const parsed = parseGitHubUrl(inputUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub URL format. Please enter a valid URL (e.g., https://github.com/facebook/react)');
  }

  const { owner, repo } = parsed;

  try {
    // 1. Fetch Repository Metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    });

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        throw new Error(`GitHub repository '${owner}/${repo}' not found or is private.`);
      }
      throw new Error(`GitHub API error (${repoRes.status}): ${repoRes.statusText}`);
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    // 2. Fetch README Content
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { Accept: 'application/vnd.github.v3.raw' },
    });

    if (!readmeRes.ok) {
      throw new Error(`Could not fetch README for '${owner}/${repo}'.`);
    }

    let rawReadme = await readmeRes.text();

    // 3. Rewrite relative image paths to raw.githubusercontent.com
    rawReadme = fixRelativeImageUrls(rawReadme, owner, repo, defaultBranch);

    return {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description || 'No description provided.',
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      license: repoData.license?.spdx_id || 'MIT',
      version: repoData.default_branch || 'main',
      owner,
      repo,
      rawReadme,
      defaultBranch,
    };
  } catch (error) {
    console.error('Error fetching GitHub repository details:', error);
    throw error;
  }
}

/**
 * Fixes relative Markdown image URLs to absolute raw.githubusercontent.com links.
 */
function fixRelativeImageUrls(markdown: string, owner: string, repo: string, branch: string): string {
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/`;

  return markdown.replace(/!\[(.*?)\]\(((?!https?:\/\/|\/\/)[^\)]+)\)/g, (match, alt, path) => {
    const cleanPath = path.replace(/^\.\//, '');
    return `![${alt}](${rawBase}${cleanPath})`;
  });
}
