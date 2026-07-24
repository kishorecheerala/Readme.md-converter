'use client';

import { AIToolsModal } from '@/components/AIToolsModal';
import { EditorPane } from '@/components/EditorPane';
import { GitHubImportModal } from '@/components/GitHubImportModal';
import { Navbar } from '@/components/Navbar';
import { PreviewPane } from '@/components/PreviewPane';
import { SettingsModal } from '@/components/SettingsModal';
import { SAMPLE_DOCUMENTS } from '@/lib/constants/samples';
import { THEMES } from '@/lib/constants/themes';
import { exportToPDF } from '@/lib/export/pdf';
import {
  CoverPageConfig,
  ExportFormat,
  GitHubRepoMetadata,
  HeaderFooterConfig,
  PageOrientation,
  PageSize,
  ThemeId,
  WatermarkConfig
} from '@/types';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

export default function Home() {
  const [markdown, setMarkdown] = useState<string>(SAMPLE_DOCUMENTS[0].content);
  const [beautifiedMd, setBeautifiedMd] = useState<string>('');
  const [themeId, setThemeId] = useState<ThemeId>('classic');
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [orientation, setOrientation] = useState<PageOrientation>('portrait');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [customCss, setCustomCss] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAIToolsOpen, setIsAIToolsOpen] = useState<boolean>(false);
  const [isGitHubImportOpen, setIsGitHubImportOpen] = useState<boolean>(false);

  // Cover page configuration
  const [coverPage, setCoverPage] = useState<CoverPageConfig>({
    enabled: true,
    title: 'Enterprise Core Engine Documentation',
    subtitle: 'High-Throughput Asynchronous Microservice Framework',
    author: 'Engineering Core Architecture Team',
    version: 'v2.4.0',
    date: new Date().toLocaleDateString(),
    confidentialLabel: 'INTERNAL USE ONLY',
    themeStyle: 'standard',
    abstractText:
      'This document provides high-level architectural specifications, mathematical guarantees, and quick start guides for the Enterprise Core Engine.',
  });

  // Header & Footer configuration
  const [headerFooter, setHeaderFooter] = useState<HeaderFooterConfig>({
    enabledHeader: true,
    enabledFooter: true,
    headerLeft: 'DocuCraft Pro Specs',
    headerRight: 'CONFIDENTIAL',
    footerLeft: 'Enterprise Core Architecture',
    footerRight: 'v2.4.0',
    showPageNumbers: true,
    showCoverPageNumbers: false,
  });

  // Watermark configuration
  const [watermark, setWatermark] = useState<WatermarkConfig>({
    enabled: false,
    text: 'CONFIDENTIAL',
    opacity: 0.1,
    color: '#ef4444',
    angle: -45,
    fontSize: 72,
  });

  // Sample document loader
  const handleLoadSample = (sampleId: string) => {
    const found = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (found) {
      setMarkdown(found.content);
      setCoverPage((prev) => ({
        ...prev,
        title: found.name,
        subtitle: `Professional Documentation Preset (${found.category})`,
      }));
    }
  };

  // GitHub repository importer handler
  const handleGitHubImport = (meta: GitHubRepoMetadata) => {
    setMarkdown(meta.rawReadme);
    setCoverPage((prev) => ({
      ...prev,
      enabled: true,
      title: meta.fullName,
      subtitle: meta.description,
      author: meta.owner,
      version: meta.version,
      repositoryUrl: `https://github.com/${meta.owner}/${meta.repo}`,
    }));
  };

  // Export Dispatcher
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportNotice(`Preparing ${format.toUpperCase()} document export...`);

    try {
      if (format === 'pdf') {
        const renderElement = document.getElementById('pdf-render-target');
        if (!renderElement) throw new Error('Render element target not found');
        await exportToPDF({
          element: renderElement,
          filename: `${coverPage.title || 'document'}.pdf`,
          pageSize,
          orientation,
        });
      } else if (format === 'docx') {
        const res = await fetch('/api/convert/docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            markdown,
            title: coverPage.title || 'document',
            coverPage,
            headerFooter,
          }),
        });

        if (!res.ok) throw new Error('DOCX export failed');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${coverPage.title || 'document'}.docx`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'html') {
        const res = await fetch('/api/convert/html', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            markdown,
            title: coverPage.title || 'document',
            themeId,
            customCss,
          }),
        });

        if (!res.ok) throw new Error('HTML export failed');

        const htmlText = await res.text();
        const blob = new Blob([htmlText], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${coverPage.title || 'document'}.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'md') {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${coverPage.title || 'document'}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setExportNotice(`${format.toUpperCase()} export completed successfully!`);
    } catch (err: any) {
      console.error(err);
      setExportNotice(`Export Error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (typeof document !== 'undefined') {
      if (!isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Top Navbar */}
      <Navbar
        themeId={themeId}
        onThemeChange={setThemeId}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAITools={() => setIsAIToolsOpen(true)}
        onOpenGitHubImport={() => setIsGitHubImportOpen(true)}
        onLoadSample={handleLoadSample}
        onExport={handleExport}
        isExporting={isExporting}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Toast Notification Notification Bar */}
      {exportNotice && (
        <div className="bg-blue-600 text-white text-xs px-4 py-2 flex items-center justify-between shadow-md z-30 animate-in fade-in slide-in-from-top-2">
          <span className="flex items-center gap-2 font-medium">
            {isExporting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {exportNotice}
          </span>
        </div>
      )}

      {/* Main Workspace Split Pane */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left Pane: Markdown Editor */}
        <EditorPane
          value={markdown}
          onChange={setMarkdown}
          beautifiedValue={beautifiedMd}
          onApplyBeautified={() => setMarkdown(beautifiedMd)}
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
          customCss={customCss}
        />
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        themeId={themeId}
        onThemeChange={setThemeId}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        orientation={orientation}
        onOrientationChange={setOrientation}
        coverPage={coverPage}
        onCoverPageChange={setCoverPage}
        headerFooter={headerFooter}
        onHeaderFooterChange={setHeaderFooter}
        watermark={watermark}
        onWatermarkChange={setWatermark}
        customCss={customCss}
        onCustomCssChange={setCustomCss}
      />

      <AIToolsModal
        isOpen={isAIToolsOpen}
        onClose={() => setIsAIToolsOpen(false)}
        markdown={markdown}
        onUpdateMarkdown={setMarkdown}
        onSetBeautified={setBeautifiedMd}
      />

      <GitHubImportModal
        isOpen={isGitHubImportOpen}
        onClose={() => setIsGitHubImportOpen(false)}
        onImportRepo={handleGitHubImport}
      />
    </div>
  );
}
