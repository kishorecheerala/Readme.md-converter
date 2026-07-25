'use client';

import { PDFDocument } from 'pdf-lib';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  GripVertical,
  Loader2,
  RotateCcw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface PageInfo {
  pageIndex: number; // original page index in PDF
  deleted: boolean;
}

export default function PDFEditorStudioPage() {
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [pageCanvases, setPageCanvases] = useState<Map<number, string>>(new Map());
  const [selectedPage, setSelectedPage] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('Loading PDF document...');
  const [totalOriginalPages, setTotalOriginalPages] = useState<number>(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Load PDF from IndexedDB on mount
  useEffect(() => {
    loadPDFFromStorage();
  }, []);

  const loadPDFFromStorage = async () => {
    try {
      const db = await openDB();
      const tx = db.transaction('pdfs', 'readonly');
      const store = tx.objectStore('pdfs');
      const request = store.get('editor-pdf');

      request.onsuccess = async () => {
        const result = request.result;
        if (result && result.data) {
          const bytes = new Uint8Array(result.data);
          setPdfBytes(bytes);
          await renderAllPages(bytes);
        } else {
          setNotice('No PDF found. Please generate a PDF from the main page first.');
          setIsLoading(false);
        }
      };

      request.onerror = () => {
        setNotice('Failed to load PDF from storage.');
        setIsLoading(false);
      };
    } catch (err) {
      console.error('IndexedDB error:', err);
      setNotice('Failed to access PDF storage.');
      setIsLoading(false);
    }
  };

  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ReadmeConverterPDFs', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('pdfs')) {
          db.createObjectStore('pdfs', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  const renderAllPages = async (bytes: Uint8Array) => {
    try {
      setNotice('Rendering PDF pages...');

      // Dynamic import of pdfjs-dist for client-side only
      const pdfjsLib = await import('pdfjs-dist');

      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      setTotalOriginalPages(numPages);

      const pageInfos: PageInfo[] = [];
      const canvasMap = new Map<number, string>();

      for (let i = 0; i < numPages; i++) {
        pageInfos.push({ pageIndex: i, deleted: false });

        const page = await pdf.getPage(i + 1); // 1-indexed
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvas, canvasContext: ctx, viewport } as any).promise;
        canvasMap.set(i, canvas.toDataURL('image/png'));
      }

      setPages(pageInfos);
      setPageCanvases(canvasMap);
      setIsLoading(false);
      setNotice('');
    } catch (err: any) {
      console.error('PDF render error:', err);
      setNotice(`Error rendering PDF: ${err.message || String(err)}`);
      setIsLoading(false);
    }
  };

  // Page operations
  const handleDeletePage = (idx: number) => {
    setPages((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], deleted: true };
      return next;
    });
  };

  const handleRestorePage = (idx: number) => {
    setPages((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], deleted: false };
      return next;
    });
  };

  const handleMoveUp = (idx: number) => {
    if (idx === 0) return;
    setPages((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
    setSelectedPage(idx - 1);
  };

  const handleMoveDown = (idx: number) => {
    setPages((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
    setSelectedPage(idx + 1);
  };

  const handleResetAll = () => {
    if (!pdfBytes) return;
    const restored: PageInfo[] = [];
    for (let i = 0; i < totalOriginalPages; i++) {
      restored.push({ pageIndex: i, deleted: false });
    }
    setPages(restored);
    setSelectedPage(0);
  };

  // Export final edited PDF
  const handleExportPDF = async () => {
    if (!pdfBytes) return;
    setIsExporting(true);
    setNotice('Generating final edited PDF...');

    try {
      const srcDoc = await PDFDocument.load(pdfBytes);
      const finalDoc = await PDFDocument.create();

      // Copy only non-deleted pages in the user's chosen order
      const activePages = pages.filter((p) => !p.deleted);
      const pageIndices = activePages.map((p) => p.pageIndex);

      const copiedPages = await finalDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((page) => finalDoc.addPage(page));

      const finalBytes = await finalDoc.save();
      const blob = new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document-edited.pdf';
      a.click();
      URL.revokeObjectURL(url);

      setNotice('Edited PDF downloaded successfully!');
    } catch (err: any) {
      console.error('Export error:', err);
      setNotice(`Export Error: ${err.message || String(err)}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setNotice(''), 4000);
    }
  };

  const activePages = pages.filter((p) => !p.deleted);
  const currentPage = pages[selectedPage];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Toolbar */}
      <header className="h-14 px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-4">
          <a
            href="/"
            className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-sm">
              PDF
            </div>
            <span className="font-bold text-sm text-white">Visual PDF Editor</span>
          </a>

          <span className="text-slate-700">|</span>

          <span className="text-xs text-slate-400 font-mono">
            {activePages.length} of {totalOriginalPages} pages
          </span>
        </div>

        {/* Zoom & Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            title="Reset all changes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <button onClick={() => setZoom((z) => Math.max(50, z - 15))} className="text-slate-400 hover:text-white p-0.5">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono text-slate-300 w-10 text-center">{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(200, z + 15))} className="text-slate-400 hover:text-white p-0.5">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportPDF}
            disabled={isExporting || activePages.length === 0}
            className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-md transition-all"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Download Edited PDF</span>
          </button>
        </div>
      </header>

      {/* Toast */}
      {notice && (
        <div className="bg-blue-600 text-white text-xs px-4 py-2 flex items-center justify-center font-medium shadow-md z-40 shrink-0">
          {(isLoading || isExporting) && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
          {notice}
        </div>
      )}

      {/* Main Area: Sidebar + Preview */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Page Thumbnails */}
          <aside className="w-64 bg-slate-900 border-r border-slate-800 overflow-y-auto shrink-0 p-3 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1 mb-2">
              Pages
            </h3>
            {pages.map((page, idx) => (
              <div
                key={`page-${idx}-${page.pageIndex}`}
                onClick={() => setSelectedPage(idx)}
                className={`relative rounded-xl border-2 cursor-pointer transition-all overflow-hidden group ${
                  page.deleted
                    ? 'opacity-40 border-red-800 bg-red-950/30'
                    : selectedPage === idx
                    ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-900/20'
                    : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                }`}
              >
                {/* Thumbnail */}
                <div className="p-1.5">
                  {pageCanvases.has(page.pageIndex) && (
                    <img
                      src={pageCanvases.get(page.pageIndex)}
                      alt={`Page ${idx + 1}`}
                      className="w-full rounded-md"
                      draggable={false}
                    />
                  )}
                </div>

                {/* Page Label */}
                <div className="px-2 pb-2 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${page.deleted ? 'text-red-400 line-through' : 'text-slate-300'}`}>
                    Page {idx + 1}
                    <span className="text-slate-600 ml-1">(orig #{page.pageIndex + 1})</span>
                  </span>
                </div>

                {/* Action Buttons on Hover */}
                <div className="absolute top-1.5 right-1.5 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!page.deleted && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMoveUp(idx); }}
                        disabled={idx === 0}
                        className="p-1 bg-slate-700/90 hover:bg-slate-600 text-white rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMoveDown(idx); }}
                        disabled={idx === pages.length - 1}
                        className="p-1 bg-slate-700/90 hover:bg-slate-600 text-white rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeletePage(idx); }}
                        className="p-1 bg-red-700/90 hover:bg-red-600 text-white rounded-md"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                  {page.deleted && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRestorePage(idx); }}
                      className="p-1 bg-emerald-700/90 hover:bg-emerald-600 text-white rounded-md"
                      title="Restore Page"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Deleted Overlay */}
                {page.deleted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-950/50 rounded-xl">
                    <span className="text-xs font-bold text-red-400 bg-red-950/80 px-2 py-1 rounded-md">DELETED</span>
                  </div>
                )}
              </div>
            ))}
          </aside>

          {/* Main Preview Area */}
          <main
            ref={canvasContainerRef}
            className="flex-1 overflow-auto bg-slate-950 flex justify-center p-8"
          >
            {currentPage && !currentPage.deleted && pageCanvases.has(currentPage.pageIndex) ? (
              <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }} className="transition-transform duration-200">
                <div className="bg-white rounded-sm shadow-2xl overflow-hidden">
                  <img
                    src={pageCanvases.get(currentPage.pageIndex)}
                    alt={`Page ${selectedPage + 1}`}
                    className="block"
                    draggable={false}
                  />
                </div>
                <div className="text-center mt-4 text-xs text-slate-500 font-mono">
                  Page {selectedPage + 1} of {pages.length} • Original Page #{currentPage.pageIndex + 1}
                </div>
              </div>
            ) : currentPage?.deleted ? (
              <div className="flex flex-col items-center justify-center text-slate-500">
                <Trash2 className="w-12 h-12 mb-3 text-red-500/50" />
                <p className="font-semibold text-sm">This page has been deleted</p>
                <button
                  onClick={() => handleRestorePage(selectedPage)}
                  className="mt-3 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Restore Page
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center text-slate-500 text-sm">
                Select a page from the sidebar to preview
              </div>
            )}
          </main>
        </div>
      )}

      {/* Bottom Page Navigator */}
      {!isLoading && pages.length > 0 && (
        <footer className="h-10 bg-slate-900 border-t border-slate-800 flex items-center justify-center space-x-4 shrink-0">
          <button
            onClick={() => setSelectedPage((p) => Math.max(0, p - 1))}
            disabled={selectedPage === 0}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400">
            Page {selectedPage + 1} / {pages.length}
          </span>
          <button
            onClick={() => setSelectedPage((p) => Math.min(pages.length - 1, p + 1))}
            disabled={selectedPage >= pages.length - 1}
            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      )}
    </div>
  );
}
