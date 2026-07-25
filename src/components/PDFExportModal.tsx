'use client';

import { Download, Edit3, ExternalLink, FileText, Sparkles, X } from 'lucide-react';
import React from 'react';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectDownload: () => void;
  onOpenStudio: () => void;
}

export const PDFExportModal: React.FC<PDFExportModalProps> = ({
  isOpen,
  onClose,
  onDirectDownload,
  onOpenStudio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">PDF Export Options</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Choose how you want to generate your PDF document</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Option 1: Edit & Preview in New Tab */}
          <div
            onClick={onOpenStudio}
            className="group relative p-5 bg-gradient-to-b from-blue-50/50 to-indigo-50/30 dark:from-slate-800/60 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800/60 hover:border-blue-600 dark:hover:border-blue-500 rounded-xl cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-blue-600 text-white rounded-lg shadow-xs">
                  <Edit3 className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Option 1
                  <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm mb-1">
                Visual PDF Studio (New Tab)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Opens interactive Stirling PDF editor in a new tab. Adjust page breaks, drag reorder sections, tweak spacing, and export when ready.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-blue-100 dark:border-slate-700/60 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 gap-1 group-hover:translate-x-1 transition-transform">
              <span>Open PDF Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Option 2: Direct Download */}
          <div
            onClick={onDirectDownload}
            className="group relative p-5 bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-200 dark:border-slate-700/60 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 bg-emerald-600 text-white rounded-lg shadow-xs">
                  <Download className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  Option 2
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-sm mb-1">
                Direct PDF Download
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Instantly generates & downloads vector PDF document using your active theme, page size, and margins.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
              <span>Download PDF Directly</span>
              <Download className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-[11px] text-slate-400 text-center">
          Pro Tip: Use <strong className="text-slate-600 dark:text-slate-300">Option 1</strong> to inspect exact page boundaries and adjust line spacing before final export.
        </div>
      </div>
    </div>
  );
};
