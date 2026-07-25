'use client';

import { THEMES } from '@/lib/constants/themes';
import { parseMarkdownToHtml } from '@/lib/markdown/parser';
import { ThemeId } from '@/types';
import {
  Download,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  Printer,
  RotateCcw,
  Scissors,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PAGE_PADDING = 60;
const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_PADDING * 2;

export default function PDFEditorStudioPage() {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [themeId, setThemeId] = useState<ThemeId>('classic');
  const [zoom, setZoom] = useState<number>(75);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notice, setNotice] = useState<string>('Loading document...');
  const [pageCount, setPageCount] = useState<number>(1);
  const [pageBoundaries, setPageBoundaries] = useState<number[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const theme = THEMES[themeId] || THEMES.classic;

  useEffect(() => {
    const loadData = async () => {
      const md = localStorage.getItem('readme_converter_studio_md') || '';
      const savedTheme = localStorage.getItem('readme_converter_studio_theme') as ThemeId;
      if (savedTheme && THEMES[savedTheme]) setThemeId(savedTheme);
      if (md) {
        const html = await parseMarkdownToHtml(md);
        setRenderedHtml(html);
      } else {
        setNotice('No document found. Go back and click "Edit PDF" from the main page.');
      }
      setIsLoading(false);
      setNotice('');
    };
    loadData();
  }, []);

  const calculatePageBoundaries = useCallback(() => {
    if (!editorRef.current) return;
    const totalHeight = editorRef.current.scrollHeight;
    const pages = Math.ceil(totalHeight / CONTENT_HEIGHT);
    setPageCount(Math.max(1, pages));
    const boundaries: number[] = [];
    for (let i = 1; i < pages; i++) {
      boundaries.push(i * CONTENT_HEIGHT);
    }
    setPageBoundaries(boundaries);
  }, []);

  useEffect(() => {
    if (!renderedHtml) return;
    const timer = setTimeout(calculatePageBoundaries, 300);
    return () => clearTimeout(timer);
  }, [renderedHtml, calculatePageBoundaries]);

  const handleInput = () => {
    setTimeout(calculatePageBoundaries, 150);
  };

  const handleInsertPageBreak = () => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    const breakEl = document.createElement('div');
    breakEl.className = 'pdf-page-break';
    breakEl.setAttribute('contenteditable', 'false');
    breakEl.innerHTML = '<span class="break-label">PAGE BREAK</span>';
    if (!selection || selection.rangeCount === 0 || !editorRef.current.contains(selection.anchorNode)) {
      editorRef.current.appendChild(breakEl);
    } else {
      const range = selection.getRangeAt(0);
      range.insertNode(breakEl);
      range.setStartAfter(breakEl);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    breakEl.addEventListener('click', () => { breakEl.remove(); handleInput(); });
    handleInput();
  };

  const handleAddSpacing = (amount: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const node = selection.anchorNode;
    const el = node?.nodeType === 1 ? (node as HTMLElement) : node?.parentElement;
    if (!el) return;
    const blockEl = el.closest('h1,h2,h3,h4,h5,h6,p,table,pre,blockquote,ul,ol,div,li') as HTMLElement;
    if (blockEl) {
      const current = parseInt(window.getComputedStyle(blockEl).marginTop || '0', 10);
      blockEl.style.marginTop = `${Math.max(0, current + amount)}px`;
      handleInput();
    }
  };

  const handleReset = async () => {
    const md = localStorage.getItem('readme_converter_studio_md') || '';
    const html = await parseMarkdownToHtml(md);
    setRenderedHtml(html);
    setNotice('Reset to original.');
    setTimeout(() => setNotice(''), 2000);
  };

  // ===== THE KEY FUNCTION: Open browser print dialog with exact layout =====
  const handlePrintPDF = () => {
    if (!editorRef.current) return;
    const editedHtml = editorRef.current.innerHTML;

    const printHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>PDF Export</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  @page {
    size: A4;
    margin: 20mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: ${theme.styles.fontFamily};
    font-size: ${theme.styles.fontSize};
    line-height: ${theme.styles.lineHeight};
    color: ${theme.styles.textColor};
    background: white;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  code::before, code::after { content: "" !important; display: none !important; }
  strong, b { color: ${theme.styles.headingColor}; font-weight: 700; }
  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.styles.headingFontFamily || theme.styles.fontFamily};
    color: ${theme.styles.headingColor};
    break-inside: avoid; page-break-inside: avoid;
    break-after: avoid; page-break-after: avoid;
  }
  h1 { font-size: 2em; font-weight: 800; border-bottom: 2px solid ${theme.styles.borderColor}; padding-bottom: 0.4em; margin: 1.5em 0 0.6em; }
  h2 { font-size: 1.5em; font-weight: 700; border-bottom: 1px solid ${theme.styles.borderColor}; padding-bottom: 0.3em; margin: 1.3em 0 0.5em; }
  h3 { font-size: 1.25em; font-weight: 600; margin: 1.1em 0 0.4em; }
  h4 { font-size: 1.1em; font-weight: 600; margin: 1em 0 0.4em; }
  p { margin: 0 0 1em; break-inside: avoid; page-break-inside: avoid; }
  a { color: ${theme.styles.accentColor}; text-decoration: underline; }
  code {
    font-family: ${theme.styles.codeFontFamily || "'JetBrains Mono', monospace"};
    background: ${theme.styles.codeBg}; color: ${theme.styles.codeTextColor};
    padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.88em;
    border: 1px solid ${theme.styles.borderColor};
  }
  pre {
    background: ${theme.styles.codeBg}; padding: 1em; border-radius: 8px;
    border: 1px solid ${theme.styles.borderColor}; white-space: pre-wrap;
    word-break: break-word; margin: 1em 0;
    break-inside: avoid; page-break-inside: avoid;
  }
  pre code { background: none; border: none; padding: 0; }
  table {
    width: 100%; border-collapse: collapse; border: 1px solid ${theme.styles.borderColor};
    margin: 1em 0; break-inside: avoid; page-break-inside: avoid;
  }
  th {
    background: ${theme.styles.tableHeaderBg}; color: ${theme.styles.headingColor};
    font-weight: 700; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.03em;
    padding: 0.65em 0.9em; border: 1px solid ${theme.styles.borderColor}; text-align: left;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  td { padding: 0.55em 0.9em; border: 1px solid ${theme.styles.borderColor}; font-size: 0.93em; }
  tr:nth-child(even) { background: ${theme.styles.tableAltRowBg}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  blockquote {
    border-left: 4px solid ${theme.styles.blockquoteBorderColor}; background: ${theme.styles.blockquoteBg};
    padding: 0.8em 1em; margin: 1em 0; border-radius: 0 6px 6px 0; font-style: italic;
    break-inside: avoid; page-break-inside: avoid;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  ul, ol { padding-left: 1.5em; margin: 0 0 1em; }
  li { margin-bottom: 0.25em; line-height: 1.6; break-inside: avoid; page-break-inside: avoid; }
  hr { border: none; height: 1px; background: ${theme.styles.borderColor}; margin: 1.5em 0; }
  img { max-width: 100%; height: auto; border-radius: 6px; break-inside: avoid; page-break-inside: avoid; }
  .pdf-page-break {
    break-before: page !important; page-break-before: always !important;
    height: 0; margin: 0; padding: 0; border: none; visibility: hidden;
  }
  .break-label { display: none !important; }
  .page-boundary-line { display: none !important; }
</style>
</head>
<body>${editedHtml}</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setNotice('Popup blocked. Please allow popups for this site.');
      return;
    }
    printWindow.document.write(printHtml);
    printWindow.document.close();

    // Wait for fonts/styles to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 600);
    };
    // Fallback if onload doesn't fire
    setTimeout(() => {
      try { printWindow.print(); } catch (e) {}
    }, 1500);
  };

  // Open Stirling-PDF for advanced editing
  const handleOpenStirlingPDF = () => {
    window.open('https://stirlingpdf.io/', '_blank');
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
      {/* Toolbar */}
      <header className="h-14 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <a href="/" className="flex items-center space-x-2 text-slate-300 hover:text-white">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-xs">PDF</div>
            <span className="font-bold text-sm text-white">PDF Editor</span>
          </a>
          <span className="text-slate-700">|</span>
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{pageCount} pages</span>

          <button onClick={handleInsertPageBreak} className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold border border-slate-700" title="Insert page break">
            <Scissors className="w-3.5 h-3.5" /><span>Page Break</span>
          </button>
          <button onClick={() => handleAddSpacing(24)} className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs font-semibold border border-slate-700" title="Push down">
            <Plus className="w-3.5 h-3.5" /><span>Push ↓</span>
          </button>
          <button onClick={() => handleAddSpacing(-24)} className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold border border-slate-700" title="Pull up">
            <Minus className="w-3.5 h-3.5" /><span>Pull ↑</span>
          </button>
          <button onClick={handleReset} className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg text-xs font-semibold border border-slate-700" title="Reset">
            <RotateCcw className="w-3.5 h-3.5" /><span>Reset</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <select value={themeId} onChange={(e) => setThemeId(e.target.value as ThemeId)} className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg">
            {Object.values(THEMES).map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
          </select>
          <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <button onClick={() => setZoom((z) => Math.max(40, z - 10))} className="text-slate-400 hover:text-white p-0.5"><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="text-xs font-mono text-slate-300 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(150, z + 10))} className="text-slate-400 hover:text-white p-0.5"><ZoomIn className="w-3.5 h-3.5" /></button>
          </div>

          <button onClick={handleOpenStirlingPDF} className="flex items-center space-x-1.5 px-3 py-1.5 bg-violet-700 hover:bg-violet-600 text-white rounded-lg text-xs font-bold border border-violet-600 transition-all" title="Open Stirling-PDF for advanced editing">
            <ExternalLink className="w-3.5 h-3.5" /><span>Stirling PDF</span>
          </button>

          <button onClick={handlePrintPDF} className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all">
            <Printer className="w-4 h-4" /><span>Print / Save PDF</span>
          </button>
        </div>
      </header>

      {notice && (
        <div className="bg-blue-600 text-white text-xs px-4 py-2 flex items-center justify-center font-medium shadow-md z-40 shrink-0">{notice}</div>
      )}

      {/* Tip */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-5 py-2 text-[11px] text-slate-400 shrink-0">
        <strong className="text-slate-200">How to edit:</strong> Click any text to edit it directly • Use <strong className="text-emerald-400">Push ↓</strong> / <strong className="text-amber-400">Pull ↑</strong> to move content between pages • <strong className="text-blue-400">Page Break</strong> forces a new page • <span className="text-red-400">Red dashed lines</span> = page boundaries • Click <strong className="text-emerald-400">Print / Save PDF</strong> to see exact print preview and save • Use <strong className="text-violet-400">Stirling PDF</strong> for advanced editing of the final PDF file
      </div>

      {/* Editor */}
      <main className="flex-1 overflow-auto bg-slate-950 py-8">
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }} className="transition-transform duration-200 flex flex-col items-center">
          <div className="relative" style={{ width: `${PAGE_WIDTH}px` }}>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="outline-none focus:outline-none pdf-editor-content"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
              onInput={handleInput}
              spellCheck={false}
              style={{
                fontFamily: theme.styles.fontFamily,
                fontSize: theme.styles.fontSize,
                lineHeight: theme.styles.lineHeight,
                color: theme.styles.textColor,
                padding: `${PAGE_PADDING}px`,
                background: 'white',
                boxSizing: 'border-box',
              }}
            />

            {/* Page Boundary Lines */}
            {pageBoundaries.map((yPos, idx) => (
              <div key={`b-${idx}`} className="page-boundary-line" style={{ position: 'absolute', left: '-20px', right: '-20px', top: `${yPos + PAGE_PADDING}px`, height: '48px', zIndex: 20, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(239,68,68,0.08), #0f172a 25%, #0f172a 75%, rgba(239,68,68,0.08))', borderTop: '2px dashed #ef4444', borderBottom: '2px dashed #ef4444' }} />
                <span style={{ position: 'relative', zIndex: 21, fontFamily: 'ui-monospace, monospace', fontSize: '10px', fontWeight: 700, color: '#ef4444', background: '#1e293b', padding: '3px 16px', borderRadius: '4px', border: '1px solid #7f1d1d', letterSpacing: '0.12em', textTransform: 'uppercase', userSelect: 'none' }}>
                  End Page {idx + 1} — Page {idx + 2}
                </span>
              </div>
            ))}

            {/* Page Labels */}
            {Array.from({ length: pageCount }, (_, i) => (
              <div key={`pl-${i}`} style={{ position: 'absolute', right: '-85px', top: `${i * CONTENT_HEIGHT + PAGE_PADDING + CONTENT_HEIGHT / 2 - 12}px`, fontFamily: 'ui-monospace', fontSize: '10px', fontWeight: 700, color: '#64748b', background: '#1e293b', padding: '4px 10px', borderRadius: '6px', border: '1px solid #334155', userSelect: 'none', pointerEvents: 'none' }}>
                Page {i + 1}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Styles */}
      <style jsx global>{`
        .pdf-editor-content code::before, .pdf-editor-content code::after { content: "" !important; display: none !important; }
        .pdf-editor-content h1 { font-size:2.1em; font-weight:800; color:${theme.styles.headingColor}; border-bottom:2px solid ${theme.styles.borderColor}; padding-bottom:0.4em; margin:1.5em 0 0.6em; line-height:1.35; }
        .pdf-editor-content h2 { font-size:1.5em; font-weight:700; color:${theme.styles.headingColor}; border-bottom:1px solid ${theme.styles.borderColor}; padding-bottom:0.3em; margin:1.4em 0 0.5em; line-height:1.35; }
        .pdf-editor-content h3 { font-size:1.25em; font-weight:600; color:${theme.styles.headingColor}; margin:1.2em 0 0.4em; }
        .pdf-editor-content h4 { font-size:1.1em; font-weight:600; color:${theme.styles.headingColor}; margin:1em 0 0.4em; }
        .pdf-editor-content p { margin-bottom:1em; line-height:${theme.styles.lineHeight}; }
        .pdf-editor-content strong, .pdf-editor-content b { color:${theme.styles.headingColor}; }
        .pdf-editor-content a { color:${theme.styles.accentColor}; text-decoration:underline; }
        .pdf-editor-content code { font-family:${theme.styles.codeFontFamily || 'monospace'}; background:${theme.styles.codeBg}; color:${theme.styles.codeTextColor}; padding:0.2em 0.4em; border-radius:5px; font-size:0.88em; border:1px solid ${theme.styles.borderColor}; }
        .pdf-editor-content pre { background:${theme.styles.codeBg}; padding:1em; border-radius:8px; border:1px solid ${theme.styles.borderColor}; white-space:pre-wrap; word-break:break-word; margin:1.2em 0; }
        .pdf-editor-content pre code { background:none; border:none; padding:0; }
        .pdf-editor-content table { width:100%; border-collapse:separate; border-spacing:0; border:1px solid ${theme.styles.borderColor}; border-radius:8px; overflow:hidden; margin:1.5em 0; }
        .pdf-editor-content th { background:${theme.styles.tableHeaderBg}; color:${theme.styles.headingColor}; font-weight:700; font-size:0.85em; text-transform:uppercase; letter-spacing:0.04em; padding:0.8em 1em; border-bottom:2px solid ${theme.styles.borderColor}; border-right:1px solid ${theme.styles.borderColor}; text-align:left; }
        .pdf-editor-content td { padding:0.7em 1em; border-bottom:1px solid ${theme.styles.borderColor}; border-right:1px solid ${theme.styles.borderColor}; font-size:0.94em; }
        .pdf-editor-content th:last-child, .pdf-editor-content td:last-child { border-right:none; }
        .pdf-editor-content tr:last-child td { border-bottom:none; }
        .pdf-editor-content tr:nth-child(even) { background:${theme.styles.tableAltRowBg}; }
        .pdf-editor-content blockquote { border-left:4px solid ${theme.styles.blockquoteBorderColor}; background:${theme.styles.blockquoteBg}; padding:0.8em 1em; margin:1.2em 0; border-radius:0 8px 8px 0; font-style:italic; }
        .pdf-editor-content ul, .pdf-editor-content ol { padding-left:1.5em; margin-bottom:1em; }
        .pdf-editor-content li { margin-bottom:0.3em; line-height:1.6; }
        .pdf-editor-content hr { border:none; height:1px; background:${theme.styles.borderColor}; margin:1.8em 0; }
        .pdf-editor-content img { max-width:100%; height:auto; border-radius:6px; }
        .pdf-page-break { height:36px; border-top:2px dashed #3b82f6; border-bottom:2px dashed #3b82f6; margin:16px -${PAGE_PADDING}px; padding:0 ${PAGE_PADDING}px; display:flex; align-items:center; justify-content:center; background:repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(59,130,246,0.05) 8px,rgba(59,130,246,0.05) 16px); cursor:pointer; }
        .pdf-page-break:hover { background:rgba(239,68,68,0.08); border-color:#ef4444; }
        .pdf-page-break .break-label { font-family:ui-monospace; font-size:10px; font-weight:700; color:#3b82f6; background:white; padding:2px 12px; border-radius:4px; border:1px solid #93c5fd; letter-spacing:0.1em; user-select:none; }
        .pdf-page-break:hover .break-label { color:#ef4444; border-color:#fca5a5; }
        .pdf-editor-content > *:hover { outline:2px dashed rgba(59,130,246,0.2); outline-offset:3px; border-radius:3px; }
      `}</style>
    </div>
  );
}
