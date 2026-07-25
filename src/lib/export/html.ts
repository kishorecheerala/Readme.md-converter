import { ThemeConfig } from '@/types';

export interface HTMLExportOptions {
  title: string;
  renderedHtml: string;
  theme: ThemeConfig;
  customCss?: string;
}

/**
 * Creates a standalone, self-contained HTML file string complete with styling and scripts.
 */
export function buildStandaloneHtml(options: HTMLExportOptions): string {
  const { title, renderedHtml, theme, customCss = '' } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Georgia&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  
  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">
  
  <!-- Highlight.js CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css">

  <style>
    :root {
      --font-body: ${theme.styles.fontFamily};
      --font-heading: ${theme.styles.headingFontFamily || theme.styles.fontFamily};
      --font-code: ${theme.styles.codeFontFamily || 'monospace'};
      --font-size: ${theme.styles.fontSize};
      --line-height: ${theme.styles.lineHeight};
      --bg-color: ${theme.styles.backgroundColor};
      --text-color: ${theme.styles.textColor};
      --heading-color: ${theme.styles.headingColor};
      --accent-color: ${theme.styles.accentColor};
      --code-bg: ${theme.styles.codeBg};
      --code-text: ${theme.styles.codeTextColor};
      --border-color: ${theme.styles.borderColor};
      --table-header-bg: ${theme.styles.tableHeaderBg};
      --table-alt-row: ${theme.styles.tableAltRowBg};
      --blockquote-bg: ${theme.styles.blockquoteBg};
      --blockquote-border: ${theme.styles.blockquoteBorderColor};
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      font-family: var(--font-body);
      font-size: var(--font-size);
      line-height: var(--line-height);
      background-color: var(--bg-color);
      color: var(--text-color);
      margin: 0;
      padding: ${theme.styles.padding};
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      color: var(--heading-color);
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 700;
      line-height: 1.25;
      word-break: break-word;
    }

    h1 { font-size: 2.2em; border-bottom: 2px solid var(--border-color); padding-bottom: 0.3em; }
    h2 { font-size: 1.6em; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h3 { font-size: 1.3em; }

    p { margin-bottom: 1em; word-break: break-word; }

    a { color: var(--accent-color); text-decoration: none; font-weight: 500; word-break: break-all; }
    a:hover { text-decoration: underline; }

    code {
      font-family: var(--font-code);
      background-color: var(--code-bg);
      color: var(--code-text);
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-size: 0.9em;
      word-break: break-word;
    }

    pre {
      background-color: var(--code-bg);
      padding: 1.2em;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid var(--border-color);
      white-space: pre-wrap;
      word-break: break-word;
      word-wrap: break-word;
    }

    pre code {
      background: none;
      padding: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }

    blockquote {
      background-color: var(--blockquote-bg);
      border-left: 4px solid var(--blockquote-border);
      margin: 1em 0;
      padding: 0.8em 1.2em;
      border-radius: 0 6px 6px 0;
      word-break: break-word;
    }

    table {
      width: 100%;
      max-width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      table-layout: auto;
      word-break: break-word;
    }

    th, td {
      border: 1px solid var(--border-color);
      padding: 0.75em 1em;
      text-align: left;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    th {
      background-color: var(--table-header-bg);
      font-weight: 600;
    }

    tr:nth-child(even) {
      background-color: var(--table-alt-row);
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
      margin: 1.5em auto;
    }

    .mermaid {
      text-align: center;
      margin: 1.5em 0;
      max-width: 100%;
      overflow-x: auto;
    }

    ${customCss}
  </style>

  <!-- Mermaid.js -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    });
  </script>
</head>
<body>
  ${renderedHtml}
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
