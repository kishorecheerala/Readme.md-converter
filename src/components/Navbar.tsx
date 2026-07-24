'use client';

import { THEMES } from '@/lib/constants/themes';
import { ExportFormat, ThemeId } from '@/types';
import {
  Download,
  FileCode,
  FileDown,
  FileText,
  Github,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Wand2
} from 'lucide-react';
import React from 'react';

interface NavbarProps {
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  onOpenSettings: () => void;
  onOpenAITools: () => void;
  onOpenGitHubImport: () => void;
  onLoadSample: (id: string) => void;
  onExport: (format: ExportFormat) => void;
  isExporting: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  themeId,
  onThemeChange,
  onOpenSettings,
  onOpenAITools,
  onOpenGitHubImport,
  onLoadSample,
  onExport,
  isExporting,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between shadow-xs">
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight flex items-center gap-2">
            DocuCraft <span className="text-[10px] uppercase font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.5 rounded-md">Pro</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">README & Markdown Document Studio</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center space-x-2">
        {/* Sample Docs Dropdown */}
        <select
          onChange={(e) => e.target.value && onLoadSample(e.target.value)}
          defaultValue=""
          className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-medium outline-hidden"
        >
          <option value="" disabled>Load Sample Document...</option>
          <option value="technical-readme">Technical README</option>
          <option value="api-docs">API Specification</option>
          <option value="academic-paper">Academic Research Paper</option>
          <option value="corporate-report">Corporate Strategy Report</option>
        </select>

        {/* GitHub Import */}
        <button
          onClick={onOpenGitHubImport}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <Github className="w-4 h-4" />
          <span className="hidden sm:inline">Import GitHub</span>
        </button>

        {/* Theme Picker Selector */}
        <div className="relative flex items-center">
          <select
            value={themeId}
            onChange={(e) => onThemeChange(e.target.value as ThemeId)}
            className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer font-medium outline-hidden"
          >
            {Object.values(THEMES).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <Palette className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
        </div>

        {/* AI Tools */}
        <button
          onClick={onOpenAITools}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>AI Studio</span>
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <Wand2 className="w-4 h-4" />
          <span>Page & Style</span>
        </button>

        {/* Export Buttons */}
        <div className="flex items-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-0.5 shadow-sm">
          <button
            onClick={() => onExport('pdf')}
            disabled={isExporting}
            className="flex items-center space-x-1 px-3 py-1 text-xs font-semibold hover:bg-blue-700/80 rounded-l-md transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <div className="w-[1px] h-4 bg-blue-400/50" />
          <button
            onClick={() => onExport('docx')}
            disabled={isExporting}
            className="px-2.5 py-1 text-xs font-medium hover:bg-blue-700/80 rounded-r-md transition-colors disabled:opacity-50"
            title="Export as Microsoft Word (.docx)"
          >
            DOCX
          </button>
          <div className="w-[1px] h-4 bg-blue-400/50" />
          <button
            onClick={() => onExport('html')}
            disabled={isExporting}
            className="px-2 py-1 text-xs font-medium hover:bg-blue-700/80 transition-colors disabled:opacity-50"
            title="Export Standalone HTML"
          >
            HTML
          </button>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
