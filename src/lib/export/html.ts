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
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Georgia&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Noto+Color+Emoji&family=Noto+Sans+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  
  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css">
  
  <!-- Highlight.js CSS -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github.min.css">

  <style>
    :root {
      --font-body: ${theme.styles.fontFamily}, "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
      --font-heading: ${theme.styles.headingFontFamily || theme.styles.fontFamily}, "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
      --font-code: ${theme.styles.codeFontFamily || "'JetBrains Mono'"}, "Noto Sans Mono", "Fira Code", monospace, "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji";
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

    code::before, code::after {
      content: "" !important;
      display: none !important;
    }

    body {
      font-family: var(--font-body);
      font-size: var(--font-size);
      line-height: var(--line-height);
      background-color: var(--bg-color);
      color: var(--text-color);
      margin: 0;
      padding: 40px;
      max-width: 900px;
      margin-left: auto;
      margin-right: auto;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    body > *:first-child {
      margin-top: 0 !important;
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      color: var(--heading-color);
      font-weight: 700;
      line-height: 1.25;
      word-break: break-word;
    }

    h1 { font-size: 2.1em; font-weight: 800; border-bottom: 2px solid var(--border-color); padding-bottom: 0.4em; margin-top: 1.2em; margin-bottom: 0.6em; }
    h2 { font-size: 1.5em; font-weight: 700; border-bottom: 1px solid var(--border-color); padding-bottom: 0.35em; margin-top: 1.1em; margin-bottom: 0.5em; }
    h3 { font-size: 1.25em; font-weight: 600; margin-top: 0.9em; margin-bottom: 0.4em; }
    h4 { font-size: 1.1em; font-weight: 600; margin-top: 0.8em; margin-bottom: 0.35em; }

    hr + h1, hr + h2, hr + h3, hr + h4 {
      margin-top: 0.4em !important;
    }

    p { margin-bottom: 1.2em; word-break: break-word; line-height: var(--line-height); }

    a { color: var(--accent-color); text-decoration: underline; text-underline-offset: 3px; font-weight: 500; word-break: break-all; }

    code {
      font-family: var(--font-code);
      background-color: var(--code-bg);
      color: var(--code-text);
      padding: 0.2em 0.4em;
      border-radius: 5px;
      font-size: 0.88em;
      border: 1px solid var(--border-color);
      word-break: break-word;
    }

    pre {
      font-family: var(--font-code);
      background-color: var(--code-bg);
      padding: 1.1em 1.25em;
      border-radius: 10px;
      overflow-x: auto;
      border: 1px solid var(--border-color);
      white-space: pre !important;
      word-break: normal !important;
      word-wrap: normal !important;
      font-size: 0.84em;
      line-height: 1.38;
      margin: 1.5em 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      font-variant-ligatures: none;
      letter-spacing: 0px;
    }

    pre code {
      font-family: inherit;
      background: none;
      border: none;
      padding: 0;
      white-space: pre !important;
      word-break: normal !important;
      word-wrap: normal !important;
      font-size: inherit;
      line-height: inherit;
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
      border-collapse: collapse;
      margin: 1.4em 0;
      word-break: break-word;
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    th, td {
      padding: 0.75em 1em;
      border: 1px solid var(--border-color);
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
    }

    td {
      font-size: 0.94em;
    }

    tr:nth-child(even) {
      background-color: var(--table-alt-row);
    }

    hr {
      border: none;
      height: 1px;
      background-color: var(--border-color);
      margin: 1.2em 0;
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
