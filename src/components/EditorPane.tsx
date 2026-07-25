'use client';

import { calculateDocumentStats, parseSections } from '@/lib/markdown/parser';
import { DocumentStats, SectionItem } from '@/types';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Bold,
  Code,
  FileCode2,
  FileSearch,
  GitCompare,
  Heading,
  Italic,
  Layers,
  Link as LinkIcon,
  List,
  Scissors,
  Sparkles,
  Table as TableIcon,
  Trash2,
  Upload
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface EditorPaneProps {
  value: string;
  onChange: (val: string) => void;
  beautifiedValue?: string;
  onApplyBeautified?: () => void;
  onClearCanvas?: () => void;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  value,
  onChange,
  beautifiedValue,
  onApplyBeautified,
  onClearCanvas,
  onFileUpload,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'reorder' | 'diff' | 'stats'>('editor');
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [stats, setStats] = useState<DocumentStats>({
    words: 0,
    characters: 0,
    readingTimeMinutes: 0,
    headingsCount: 0,
    codeBlocksCount: 0,
    tablesCount: 0,
    imagesCount: 0,
  });
  const [sections, setSections] = useState<SectionItem[]>([]);

  useEffect(() => {
    setStats(calculateDocumentStats(value));
    setSections(parseSections(value));
  }, [value]);

  const handleInsertFormat = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('md-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);
  };

  const handleSearchReplace = () => {
    if (!searchTerm) return;
    const updated = value.replaceAll(searchTerm, replaceTerm);
    onChange(updated);
  };

  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onFileUpload) {
      onFileUpload(e);
    } else {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) onChange(content);
      };
      reader.readAsText(file);
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;

    setSections(newSections);
    onChange(newSections.map((s) => s.content).join('\n\n'));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
      {/* Editor Sub-Header Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'editor'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Markdown Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('reorder')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'reorder'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Reorder Sections</span>
          </button>

          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'diff'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Diff View</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Document Stats</span>
          </button>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center space-x-1">
          {/* Prominent Upload File Button */}
          <label className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 rounded-md border border-emerald-200 dark:border-emerald-800 cursor-pointer transition-colors" title="Upload Markdown File">
            <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Upload File</span>
            <input type="file" accept=".md,.txt,.markdown" onChange={handleLocalFileUpload} className="hidden" />
          </label>

          {/* Clear Canvas Button */}
          {onClearCanvas && (
            <button
              onClick={onClearCanvas}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md border border-slate-200 dark:border-slate-800 transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"
            title="Search & Replace"
          >
            <FileSearch className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formatting Helper Toolbar */}
      {activeTab === 'editor' && (
        <div className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs overflow-x-auto">
          <button onClick={() => handleInsertFormat('# ')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm" title="Heading 1"><Heading className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleInsertFormat('**', '**')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleInsertFormat('*', '*')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleInsertFormat('`', '`')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm" title="Inline Code"><Code className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleInsertFormat('- ')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleInsertFormat('[Link Title](https://', ')')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm" title="Link"><LinkIcon className="w-3.5 h-3.5" /></button>
          <button onClick={() => handleInsertFormat('\n| Col 1 | Col 2 |\n| --- | --- |\n| Val 1 | Val 2 |\n')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm" title="Table"><TableIcon className="w-3.5 h-3.5" /></button>

          {/* Quick Page Break Insertion Button */}
          <button
            onClick={() => handleInsertFormat('\n\n<!-- pagebreak -->\n\n')}
            className="flex items-center space-x-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md font-semibold text-[11px]"
            title="Insert Page Break"
          >
            <Scissors className="w-3 h-3" />
            <span>+ Page Break</span>
          </button>

          <button onClick={() => handleInsertFormat('\n```mermaid\nflowchart TD\n    A[Start] --> B[End]\n```\n')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5" title="Insert Mermaid Diagram">+Mermaid</button>
          <button onClick={() => handleInsertFormat('\n$$ \\int_{0}^{\\infty} x^2 dx $$\n')} className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-sm font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5" title="Insert KaTeX Math">+Math</button>
        </div>
      )}

      {/* Search & Replace Panel */}
      {showSearch && (
        <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
          <input
            type="text"
            placeholder="Search term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded-md outline-hidden w-36"
          />
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1 rounded-md outline-hidden w-36"
          />
          <button
            onClick={handleSearchReplace}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-md font-medium"
          >
            Replace All
          </button>
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 relative overflow-hidden bg-white dark:bg-slate-900">
        {activeTab === 'editor' && (
          <textarea
            id="md-editor-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste or write your Markdown content here... (Or click 'Upload File' above)"
            className="w-full h-full p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm leading-relaxed resize-none outline-hidden border-none focus:ring-0 selection:bg-blue-500/30 transition-colors"
          />
        )}

        {activeTab === 'reorder' && (
          <div className="p-4 space-y-2 h-full overflow-y-auto bg-white dark:bg-slate-900">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Reorder document sections. Changes update the main editor instantly.</p>
            {sections.map((sec, idx) => (
              <div key={sec.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-mono">H{sec.level}</span>
                    {sec.heading}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{sec.content.slice(0, 80)}...</p>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveSection(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 rounded-md text-slate-800 dark:text-white"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveSection(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    className="p-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 rounded-md text-slate-800 dark:text-white"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="p-4 space-y-3 h-full overflow-y-auto bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Comparing current Markdown with AI Beautified version.</span>
              {beautifiedValue && onApplyBeautified && (
                <button
                  onClick={onApplyBeautified}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply AI Beautified Version</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 h-[calc(100%-40px)]">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-300">
                <h5 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-2">Current Version</h5>
                <pre className="whitespace-pre-wrap">{value}</pre>
              </div>
              <div className="p-3 bg-indigo-50/50 dark:bg-slate-950 rounded-lg border border-indigo-200 dark:border-indigo-900/40 overflow-y-auto font-mono text-xs text-indigo-900 dark:text-indigo-200">
                <h5 className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-2">AI Beautified Preview</h5>
                <pre className="whitespace-pre-wrap">{beautifiedValue || 'Click "AI Studio -> Beautify" in the top bar to generate formatted version.'}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-6 grid grid-cols-2 gap-4 bg-white dark:bg-slate-900">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Word Count</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.words.toLocaleString()}</h3>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Est. Reading Time</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.readingTimeMinutes} Min</h3>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Headings Count</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.headingsCount}</h3>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Code Blocks</p>
              <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.codeBlocksCount}</h3>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tables</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.tablesCount}</h3>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Characters</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.characters.toLocaleString()}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Editor Footer Status Bar */}
      <div className="h-7 px-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-3">
          <span>Words: <strong className="text-slate-900 dark:text-slate-200">{stats.words}</strong></span>
          <span>Chars: <strong className="text-slate-900 dark:text-slate-200">{stats.characters}</strong></span>
          <span>Reading Time: <strong className="text-blue-600 dark:text-blue-400">{stats.readingTimeMinutes} min</strong></span>
        </div>
        <div className="text-slate-500">
          Markdown Editor Active
        </div>
      </div>
    </div>
  );
};
