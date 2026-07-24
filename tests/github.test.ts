import { parseGitHubUrl } from '../src/lib/github/fetcher';

describe('GitHub Importer URL Parser', () => {
  test('parses full HTTPS GitHub URLs', () => {
    const res = parseGitHubUrl('https://github.com/facebook/react');
    expect(res).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('parses HTTPS GitHub URLs with trailing slash or .git', () => {
    const res = parseGitHubUrl('https://github.com/facebook/react.git/');
    expect(res).toEqual({ owner: 'facebook', repo: 'react' });
  });

  test('parses shorthand owner/repo pattern', () => {
    const res = parseGitHubUrl('vercel/next.js');
    expect(res).toEqual({ owner: 'vercel', repo: 'next.js' });
  });

  test('returns null for invalid inputs', () => {
    expect(parseGitHubUrl('invalid-input')).toBeNull();
  });
});
