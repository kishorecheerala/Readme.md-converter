'use client';

import { Download, Edit3, ExternalLink, FileText, X } from 'lucide-react';
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Export PDF Document</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select how you want to export your PDF file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Choices */}
        <div className="space-y-3 mb-6">
          {/* Edit PDF in Visual Studio */}
          <button
            onClick={onOpenStudio}
            className="w-full text-left p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl transition-all hover:shadow-md group flex items-start justify-between"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg mt-0.5 shadow-xs">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm">
                    Edit PDF in Visual Studio
                  </h3>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Opens generated PDF pages in an interactive editor in a new tab. Reorder pages, adjust margins, insert page breaks, and delete unwanted pages before saving.
                </p>
              </div>
            </div>
          </button>

          {/* Direct Download */}
          <button
            onClick={onDirectDownload}
            className="w-full text-left p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-xl transition-all hover:shadow-md group flex items-start justify-between"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg mt-0.5 shadow-xs">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 text-sm">
                  Direct Download
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Instantly downloads the generated vector PDF file with your current theme and settings.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 text-center border-t border-slate-100 dark:border-slate-800 pt-3">
          Need to tweak PDF page layout or remove pages? Choose <strong className="text-slate-700 dark:text-slate-200">Edit PDF in Visual Studio</strong>.
        </div>
      </div>
    </div>
  );
};
