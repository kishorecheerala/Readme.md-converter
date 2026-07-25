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
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Georgia&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  
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
      margin-top: 1.8em;
      margin-bottom: 0.8em;
      font-weight: 700;
      line-height: 1.25;
      word-break: break-word;
    }

    strong, b {
      color: var(--heading-color);
      font-weight: 700;
    }

    h1 { font-size: 2.1em; font-weight: 800; border-bottom: 2px solid var(--border-color); padding-bottom: 0.4em; }
    h2 { font-size: 1.5em; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; font-weight: 600; }

    p { margin-bottom: 1.2em; word-break: break-word; line-height: var(--line-height); }

    a { color: var(--accent-color); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; word-break: break-all; }

    code {
      font-family: var(--font-code);
      background-color: var(--code-bg);
      color: var(--code-text);
      padding: 0.25em 0.45em;
      border-radius: 6px;
      font-size: 0.88em;
      border: 1px solid var(--border-color);
      word-break: break-word;
    }

    pre {
      background-color: var(--code-bg);
      padding: 1.25em;
      border-radius: 10px;
      overflow-x: auto;
      border: 1px solid var(--border-color);
      white-space: pre-wrap;
      word-break: break-word;
      word-wrap: break-word;
      margin: 1.5em 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }

    pre code {
      background: none;
      border: none;
      padding: 0;
      white-space: pre-wrap;
      word-break: break-word;
    }

    blockquote {
      background-color: var(--blockquote-bg);
      border-left: 4px solid var(--blockquote-border);
      margin: 1.5em 0;
      padding: 1em 1.25em;
      border-radius: 0 10px 10px 0;
      font-style: italic;
      word-break: break-word;
    }

    table {
      width: 100%;
      max-width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 1.8em 0;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      overflow: hidden;
      word-break: break-word;
    }

    th, td {
      padding: 0.85em 1.1em;
      border-bottom: 1px solid var(--border-color);
      border-right: 1px solid var(--border-color);
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    th {
      background-color: var(--table-header-bg);
      color: var(--heading-color);
      font-weight: 700;
      font-size: 0.82em;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-align: left;
      border-bottom: 2px solid var(--border-color);
    }

    td {
      font-size: 0.94em;
    }

    table th:last-child, table td:last-child {
      border-right: none;
    }

    table tr:last-child td {
      border-bottom: none;
    }

    tr:nth-child(even) {
      background-color: var(--table-alt-row);
    }

    hr {
      border: none;
      height: 1px;
      background-color: var(--border-color);
      margin: 2.2em 0;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      display: inline-block;
      vertical-align: middle;
      margin: 0.4em 0.2em;
    }

    .mermaid {
      text-align: center;
      margin: 2em 0;
      padding: 1em;
      max-width: 100%;
      overflow-x: auto;
      background-color: var(--code-bg);
      border-radius: 10px;
      border: 1px solid var(--border-color);
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
