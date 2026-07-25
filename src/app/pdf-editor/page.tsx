'use client';

import { THEMES } from '@/lib/constants/themes';
import { parseMarkdownToHtml } from '@/lib/markdown/parser';
import { ThemeId } from '@/types';
import {
  Download,
  Loader2,
  Minus,
  Plus,
  RotateCcw,
  Scissors,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

export default function PDFEditorStudioPage() {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [themeId, setThemeId] = useState<ThemeId>('classic');
  const [zoom, setZoom] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('Loading document...');
  const editorRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[themeId] || THEMES.classic;

  // Load markdown + theme from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      const md = localStorage.getItem('readme_converter_studio_md') || '';
      const savedTheme = localStorage.getItem('readme_converter_studio_theme') as ThemeId;
      if (savedTheme && THEMES[savedTheme]) setThemeId(savedTheme);

      if (md) {
        const html = await parseMarkdownToHtml(md);
        setRenderedHtml(html);
      } else {
        setNotice('No document found. Please go back and click "Edit PDF" from the main page.');
      }
      setIsLoading(false);
      setNotice('');
    };
    loadData();
  }, []);

  // Insert a visible page break at the cursor position
  const handleInsertPageBreak = () => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      // Append at the end
      const breakEl = document.createElement('div');
      breakEl.className = 'pdf-page-break';
      breakEl.setAttribute('contenteditable', 'false');
      breakEl.innerHTML = '<span class="pdf-page-break-label">— PAGE BREAK —</span>';
      editorRef.current.appendChild(breakEl);
    } else {
      const range = selection.getRangeAt(0);
      const breakEl = document.createElement('div');
      breakEl.className = 'pdf-page-break';
      breakEl.setAttribute('contenteditable', 'false');
      breakEl.innerHTML = '<span class="pdf-page-break-label">— PAGE BREAK —</span>';
      range.insertNode(breakEl);
      // Move cursor after the break
      range.setStartAfter(breakEl);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Add spacing above/below cursor block
  const handleAddSpacing = (amount: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const node = selection.anchorNode;
    const block = node?.nodeType === 1
      ? (node as HTMLElement)
      : node?.parentElement;
    if (!block) return;
    // Find the nearest block-level element
    const blockEl = block.closest('h1, h2, h3, h4, h5, h6, p, table, pre, blockquote, ul, ol, div, li') as HTMLElement;
    if (blockEl) {
      const current = parseInt(window.getComputedStyle(blockEl).marginTop || '0', 10);
      blockEl.style.marginTop = `${Math.max(0, current + amount)}px`;
    }
  };

  // Reset all edits
  const handleReset = async () => {
    const md = localStorage.getItem('readme_converter_studio_md') || '';
    const html = await parseMarkdownToHtml(md);
    setRenderedHtml(html);
    setNotice('Document reset to original.');
    setTimeout(() => setNotice(''), 2000);
  };

  // Export the edited content as PDF via the server API
  const handleExportPDF = async () => {
    if (!editorRef.current) return;
    setIsExporting(true);
    setNotice('Generating PDF from your edited layout...');

    try {
      // Grab the edited HTML content from the contenteditable area
      const editedHtml = editorRef.current.innerHTML;

      // Send to the server for Chromium rendering
      const res = await fetch('/api/convert/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Pass the already-rendered HTML directly — no markdown parsing needed
          renderedHtmlDirect: editedHtml,
          title: 'document',
          themeId,
          pageSize: 'a4',
          orientation: 'portrait',
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document-edited.pdf';
        a.click();
        URL.revokeObjectURL(url);
        setNotice('PDF exported successfully!');
      } else {
        // Fallback: use browser print
        handleBrowserPrint();
      }
    } catch (err: any) {
      console.error(err);
      handleBrowserPrint();
    } finally {
      setIsExporting(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  // Browser print fallback
  const handleBrowserPrint = () => {
    if (!editorRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>PDF Export</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 15mm; }
    body {
      font-family: ${theme.styles.fontFamily};
      font-size: ${theme.styles.fontSize};
      line-height: ${theme.styles.lineHeight};
      color: ${theme.styles.textColor};
      background: white;
      padding: 0;
      margin: 0;
    }
    code::before, code::after { content: "" !important; display: none !important; }
    h1, h2, h3, h4, p, li, tr, pre, blockquote, img, table {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .pdf-page-break {
      break-before: page !important;
      page-break-before: always !important;
      height: 0;
      margin: 0;
      padding: 0;
      border: none;
    }
    .pdf-page-break-label { display: none !important; }
    h1 { font-size: 2.1em; font-weight: 800; color: ${theme.styles.headingColor}; border-bottom: 2px solid ${theme.styles.borderColor}; padding-bottom: 0.4em; }
    h2 { font-size: 1.5em; font-weight: 700; color: ${theme.styles.headingColor}; border-bottom: 1px solid ${theme.styles.borderColor}; padding-bottom: 0.3em; }
    h3 { font-size: 1.25em; font-weight: 600; color: ${theme.styles.headingColor}; }
    a { color: ${theme.styles.accentColor}; }
    code { font-family: ${theme.styles.codeFontFamily || 'monospace'}; background: ${theme.styles.codeBg}; color: ${theme.styles.codeTextColor}; padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.88em; }
    pre { background: ${theme.styles.codeBg}; padding: 1em; border-radius: 8px; border: 1px solid ${theme.styles.borderColor}; white-space: pre-wrap; word-break: break-word; }
    pre code { background: none; border: none; padding: 0; }
    table { width: 100%; border-collapse: collapse; border: 1px solid ${theme.styles.borderColor}; margin: 1em 0; }
    th { background: ${theme.styles.tableHeaderBg}; color: ${theme.styles.headingColor}; font-weight: 700; padding: 0.7em 1em; border: 1px solid ${theme.styles.borderColor}; text-align: left; }
    td { padding: 0.6em 1em; border: 1px solid ${theme.styles.borderColor}; }
    tr:nth-child(even) { background: ${theme.styles.tableAltRowBg}; }
    blockquote { border-left: 4px solid ${theme.styles.blockquoteBorderColor}; background: ${theme.styles.blockquoteBg}; padding: 0.8em 1em; margin: 1em 0; border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>${editorRef.current.innerHTML}</body>
</html>`);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Toolbar */}
      <header className="h-14 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">
              PDF
            </div>
            <span className="font-bold text-sm text-white">PDF Editor</span>
          </a>

          <span className="text-slate-700">|</span>

          {/* Editing Tools */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleInsertPageBreak}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              title="Insert a page break at cursor position"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Page Break</span>
            </button>

            <button
              onClick={() => handleAddSpacing(16)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              title="Push content down (add space above selected block)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Space ↓</span>
            </button>

            <button
              onClick={() => handleAddSpacing(-16)}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              title="Pull content up (reduce space above selected block)"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Space ↑</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
              title="Reset all edits"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right: Zoom + Export */}
        <div className="flex items-center space-x-3">
          {/* Theme Selector */}
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value as ThemeId)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg font-medium"
          >
            {Object.values(THEMES).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Zoom */}
          <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <button onClick={() => setZoom((z) => Math.max(50, z - 10))} className="text-slate-400 hover:text-white p-0.5">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-slate-300 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 10))} className="text-slate-400 hover:text-white p-0.5">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md transition-all"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Download PDF</span>
          </button>
        </div>
      </header>

      {/* Toast */}
      {notice && (
        <div className="bg-blue-600 text-white text-xs px-4 py-2 flex items-center justify-center font-medium shadow-md z-40 shrink-0">
          {isExporting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
          {notice}
        </div>
      )}

      {/* Editing Tip Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-5 py-2 text-[11px] text-slate-400 shrink-0">
        <strong className="text-slate-200">How to edit:</strong> Click any text to edit directly. Select a heading/table/paragraph, then use <strong className="text-emerald-400">Space ↓</strong> to push it to the next page or <strong className="text-amber-400">Space ↑</strong> to pull it up. Use <strong className="text-blue-400">Page Break</strong> to force content to a new page.
      </div>

      {/* Main Editable Document Area */}
      <main className="flex-1 overflow-auto bg-slate-950 flex justify-center py-10 px-4">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200"
        >
          {/* A4 Paper Container */}
          <div
            className="bg-white text-slate-900 shadow-2xl rounded-sm overflow-visible"
            style={{
              width: '794px',
              minHeight: '1123px',
              fontFamily: theme.styles.fontFamily,
              fontSize: theme.styles.fontSize,
              lineHeight: theme.styles.lineHeight,
              color: theme.styles.textColor,
              padding: '60px',
              boxSizing: 'border-box',
            }}
          >
            {/* Editable Content */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="outline-none focus:outline-none pdf-editor-content"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              spellCheck={false}
            />
          </div>
        </div>
      </main>

      {/* Editor Styles */}
      <style jsx global>{`
        .pdf-editor-content code::before,
        .pdf-editor-content code::after {
          content: "" !important;
          display: none !important;
        }
        .pdf-editor-content h1 {
          font-size: 2.1em;
          font-weight: 800;
          color: ${theme.styles.headingColor};
          border-bottom: 2px solid ${theme.styles.borderColor};
          padding-bottom: 0.4em;
          margin-top: 1.5em;
          margin-bottom: 0.6em;
          line-height: 1.35;
        }
        .pdf-editor-content h2 {
          font-size: 1.5em;
          font-weight: 700;
          color: ${theme.styles.headingColor};
          border-bottom: 1px solid ${theme.styles.borderColor};
          padding-bottom: 0.3em;
          margin-top: 1.4em;
          margin-bottom: 0.5em;
          line-height: 1.35;
        }
        .pdf-editor-content h3 {
          font-size: 1.25em;
          font-weight: 600;
          color: ${theme.styles.headingColor};
          margin-top: 1.2em;
          margin-bottom: 0.4em;
        }
        .pdf-editor-content h4 {
          font-size: 1.1em;
          font-weight: 600;
          color: ${theme.styles.headingColor};
          margin-top: 1em;
          margin-bottom: 0.4em;
        }
        .pdf-editor-content p {
          margin-bottom: 1em;
          line-height: ${theme.styles.lineHeight};
        }
        .pdf-editor-content strong, .pdf-editor-content b {
          color: ${theme.styles.headingColor};
        }
        .pdf-editor-content a {
          color: ${theme.styles.accentColor};
          text-decoration: underline;
        }
        .pdf-editor-content code {
          font-family: ${theme.styles.codeFontFamily || 'monospace'};
          background: ${theme.styles.codeBg};
          color: ${theme.styles.codeTextColor};
          padding: 0.2em 0.4em;
          border-radius: 5px;
          font-size: 0.88em;
          border: 1px solid ${theme.styles.borderColor};
        }
        .pdf-editor-content pre {
          background: ${theme.styles.codeBg};
          padding: 1em;
          border-radius: 8px;
          border: 1px solid ${theme.styles.borderColor};
          white-space: pre-wrap;
          word-break: break-word;
          margin: 1.2em 0;
        }
        .pdf-editor-content pre code {
          background: none;
          border: none;
          padding: 0;
        }
        .pdf-editor-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid ${theme.styles.borderColor};
          border-radius: 8px;
          overflow: hidden;
          margin: 1.5em 0;
        }
        .pdf-editor-content th {
          background: ${theme.styles.tableHeaderBg};
          color: ${theme.styles.headingColor};
          font-weight: 700;
          font-size: 0.85em;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.8em 1em;
          border-bottom: 2px solid ${theme.styles.borderColor};
          border-right: 1px solid ${theme.styles.borderColor};
          text-align: left;
        }
        .pdf-editor-content td {
          padding: 0.7em 1em;
          border-bottom: 1px solid ${theme.styles.borderColor};
          border-right: 1px solid ${theme.styles.borderColor};
          font-size: 0.94em;
        }
        .pdf-editor-content th:last-child,
        .pdf-editor-content td:last-child { border-right: none; }
        .pdf-editor-content tr:last-child td { border-bottom: none; }
        .pdf-editor-content tr:nth-child(even) { background: ${theme.styles.tableAltRowBg}; }
        .pdf-editor-content blockquote {
          border-left: 4px solid ${theme.styles.blockquoteBorderColor};
          background: ${theme.styles.blockquoteBg};
          padding: 0.8em 1em;
          margin: 1.2em 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }
        .pdf-editor-content ul,
        .pdf-editor-content ol {
          padding-left: 1.5em;
          margin-bottom: 1em;
        }
        .pdf-editor-content li {
          margin-bottom: 0.3em;
          line-height: 1.6;
        }
        .pdf-editor-content hr {
          border: none;
          height: 1px;
          background: ${theme.styles.borderColor};
          margin: 1.8em 0;
        }
        .pdf-editor-content img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
        }

        /* Page Break Markers */
        .pdf-page-break {
          break-before: page;
          page-break-before: always;
          height: 32px;
          border-top: 2px dashed #3b82f6;
          border-bottom: 2px dashed #3b82f6;
          margin: 24px -60px;
          padding: 0 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(59, 130, 246, 0.04) 8px,
            rgba(59, 130, 246, 0.04) 16px
          );
          cursor: pointer;
          position: relative;
        }
        .pdf-page-break:hover {
          background: rgba(239, 68, 68, 0.06);
          border-color: #ef4444;
        }
        .pdf-page-break:hover .pdf-page-break-label {
          color: #ef4444;
        }
        .pdf-page-break:hover::after {
          content: '(click to remove)';
          position: absolute;
          right: 70px;
          font-size: 10px;
          color: #ef4444;
          font-weight: 600;
        }
        .pdf-page-break-label {
          font-family: ui-monospace, monospace;
          font-size: 10px;
          font-weight: 700;
          color: #3b82f6;
          background: white;
          padding: 2px 12px;
          border-radius: 4px;
          border: 1px solid #93c5fd;
          letter-spacing: 0.1em;
          user-select: none;
        }

        /* Highlight hovered blocks */
        .pdf-editor-content > *:hover {
          outline: 2px dashed rgba(59, 130, 246, 0.25);
          outline-offset: 4px;
          border-radius: 4px;
        }
        .pdf-editor-content > *:focus-within {
          outline: 2px solid rgba(59, 130, 246, 0.4);
          outline-offset: 4px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
