'use client';

import { EditorPane } from '@/components/EditorPane';
import { PreviewPane } from '@/components/PreviewPane';
import { THEMES } from '@/lib/constants/themes';
import { exportToPDF } from '@/lib/export/pdf';
import {
  CoverPageConfig,
  HeaderFooterConfig,
  PageOrientation,
  PageSize,
  ThemeId,
  WatermarkConfig
} from '@/types';
import { Download, FileText, Loader2, RotateCcw, Scissors, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export default function PDFEditorStudioPage() {
  const [markdown, setMarkdown] = useState<string>('');
  const [themeId, setThemeId] = useState<ThemeId>('classic');
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [coverPage, setCoverPage] = useState<CoverPageConfig>({
    enabled: false,
    title: 'Document Title',
    subtitle: 'PDF Document Specification',
    author: 'Author',
    version: '1.0.0',
    date: new Date().toLocaleDateString(),
    themeStyle: 'standard',
  });

  const [headerFooter, setHeaderFooter] = useState<HeaderFooterConfig>({
    enabledHeader: false,
    enabledFooter: false,
    headerLeft: '',
    headerRight: '',
    footerLeft: '',
    footerRight: '',
    showPageNumbers: false,
    showCoverPageNumbers: false,
  });

  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    text: 'CONFIDENTIAL',
    opacity: 0.1,
    color: '#ef4444',
    angle: -45,
    fontSize: 72,
  });

  // Load state from localStorage on open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('readme_converter_studio_md');
      if (stored) setMarkdown(stored);
      const storedTheme = localStorage.getItem('readme_converter_studio_theme') as ThemeId;
      if (storedTheme) setThemeId(storedTheme);
    }
  }, []);

  // Save changes to localStorage
  const handleMarkdownChange = (val: string) => {
    setMarkdown(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('readme_converter_studio_md', val);
    }
  };

  const handleInsertPageBreak = () => {
    setMarkdown((prev) => prev + '\n\n<!-- pagebreak -->\n\n');
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setNotice('Generating final vector PDF document...');

    try {
      const res = await fetch('/api/convert/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown,
          title: coverPage.title || 'document',
          themeId,
          pageSize,
          orientation,
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${coverPage.title || 'document'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        setNotice('PDF Exported successfully!');
      } else {
        const renderElement = document.getElementById('pdf-render-target');
        if (!renderElement) throw new Error('Render element target not found');
        await exportToPDF({
          element: renderElement,
          filename: `${coverPage.title || 'document'}.pdf`,
          pageSize,
          orientation,
        });
        setNotice('PDF Exported successfully!');
      }
    } catch (err: any) {
      console.error(err);
      setNotice(`Export Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden dark bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <header className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-30">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              MD
            </div>
            <span className="font-bold text-sm text-white">Visual PDF Studio</span>
          </Link>

          <span className="text-slate-700">|</span>

          <button
            onClick={handleInsertPageBreak}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>+ Insert Page Break</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <select
            value={themeId}
            onChange={(e) => setThemeId(e.target.value as ThemeId)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg font-medium"
          >
            {Object.values(THEMES).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md transition-all"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Final PDF</span>
          </button>
        </div>
      </header>

      {/* Toast Notice */}
      {notice && (
        <div className="bg-blue-600 text-white text-xs px-4 py-2 flex items-center justify-center font-medium shadow-md z-40">
          {isExporting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
          {notice}
        </div>
      )}

      {/* Main Studio Viewport */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left Pane: Markdown Editor */}
        <EditorPane
          value={markdown}
          onChange={handleMarkdownChange}
        />

        {/* Right Pane: Live Document Preview */}
        <PreviewPane
          markdown={markdown}
          themeId={themeId}
          pageSize={pageSize}
          orientation={orientation}
          coverPage={coverPage}
          headerFooter={headerFooter}
          watermark={watermark}
        />
      </main>
    </div>
  );
}
