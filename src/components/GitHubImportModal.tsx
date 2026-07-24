'use client';

import { GitHubRepoMetadata } from '@/types';
import { Download, FileCode, Github, GitFork, Loader2, Star, X } from 'lucide-react';
import React, { useState } from 'react';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRepo: (meta: GitHubRepoMetadata) => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  isOpen,
  onClose,
  onImportRepo,
}) => {
  const [url, setUrl] = useState('https://github.com/facebook/react');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<GitHubRepoMetadata | null>(null);

  if (!isOpen) return null;

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setPreviewData(null);

    try {
      const res = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch repository');
      }

      setPreviewData(json.data);
    } catch (err: any) {
      setError(err.message || 'Error fetching GitHub repository');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (previewData) {
      onImportRepo(previewData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Github className="w-5 h-5 text-slate-900 dark:text-white" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Import from GitHub Repository</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              GitHub Repository URL or owner/repo
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-xs outline-hidden"
              />
              <button
                onClick={handleFetch}
                disabled={loading || !url}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Fetch</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {previewData && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{previewData.fullName}</h4>
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded-md font-mono text-[10px]">
                  {previewData.defaultBranch}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{previewData.description}</p>
              
              <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700 font-mono">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  {previewData.stars.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="w-3.5 h-3.5" />
                  {previewData.forks.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  License: {previewData.license}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium text-xs rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!previewData}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Import README into Editor
          </button>
        </div>
      </div>
    </div>
  );
};
