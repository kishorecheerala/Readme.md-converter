'use client';

import { analyzeDocumentQuality } from '@/lib/ai/analyzer';
import { beautifyMarkdown } from '@/lib/ai/beautifier';
import { generateMermaidDiagram } from '@/lib/ai/diagram';
import { generateDocumentSummary } from '@/lib/ai/summary';
import { AIAnalysisResult } from '@/types';
import {
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Network,
  Sparkles,
  Wand2,
  X
} from 'lucide-react';
import React, { useState } from 'react';

interface AIToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  onUpdateMarkdown: (newMd: string) => void;
  onSetBeautified: (beautified: string) => void;
}

export const AIToolsModal: React.FC<AIToolsModalProps> = ({
  isOpen,
  onClose,
  markdown,
  onUpdateMarkdown,
  onSetBeautified,
}) => {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'beautifier' | 'summary' | 'diagram'>('analyzer');
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [diagramType, setDiagramType] = useState<'flowchart' | 'sequence' | 'er'>('flowchart');
  const [diagramPrompt, setDiagramPrompt] = useState<string>('System Architecture Overview');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleRunAnalysis = () => {
    const res = analyzeDocumentQuality(markdown);
    setAnalysis(res);
  };

  const handleRunBeautifier = () => {
    const formatted = beautifyMarkdown(markdown);
    onSetBeautified(formatted);
    onUpdateMarkdown(formatted);
  };

  const handleGenerateSummary = () => {
    const summary = generateDocumentSummary(markdown);
    const summaryMarkdown = `\n\n---\n\n## 📝 Executive Summary\n\n${summary.executiveSummary}\n\n**TL;DR**: ${summary.tldr}\n`;
    onUpdateMarkdown(markdown + summaryMarkdown);
  };

  const handleInsertDiagram = () => {
    const diag = generateMermaidDiagram(diagramPrompt, diagramType);
    onUpdateMarkdown(markdown + '\n\n' + diag + '\n');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-900/30 to-purple-900/30">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">AI Document Intelligence Studio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Sub-Header Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'analyzer'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Document Quality Analyzer</span>
          </button>

          <button
            onClick={() => setActiveTab('beautifier')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'beautifier'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>AI Format Beautifier</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Executive Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('diagram')}
            className={`px-4 py-3 border-b-2 flex items-center space-x-1.5 transition-colors ${
              activeTab === 'diagram'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>AI Diagram Generator</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Analyzer */}
          {activeTab === 'analyzer' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Evaluates readability, heading hierarchy, WCAG accessibility, SEO, and missing sections.</p>
                <button
                  onClick={handleRunAnalysis}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Document</span>
                </button>
              </div>

              {analysis && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400">Overall Documentation Score</h4>
                      <p className="text-3xl font-extrabold text-indigo-400 mt-1">{analysis.overallScore} / 100</p>
                    </div>
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-500 flex items-center justify-center font-bold text-lg">
                      {analysis.overallScore}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(analysis.categories).map(([cat, val]) => (
                      <div key={cat} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold capitalize text-slate-800 dark:text-slate-200">{cat}</span>
                          <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">{val.score}/100</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {'feedback' in val ? val.feedback : (val as any).items?.join(', ') || 'No missing sections.'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {analysis.recommendations.length > 0 && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50">
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="w-4 h-4" /> Actionable Recommendations
                      </h4>
                      <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200 pl-4 list-disc">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Beautifier */}
          {activeTab === 'beautifier' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500">Automatically corrects heading spaces, list indentation, line breaks, and table alignment.</p>
              <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-xl max-h-48 overflow-y-auto">
                <pre>{markdown.slice(0, 400)}...</pre>
              </div>
              <button
                onClick={handleRunBeautifier}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Wand2 className="w-4 h-4" />
                <span>Format & Beautify Markdown</span>
              </button>
            </div>
          )}

          {/* Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500">Generates an automated Executive Summary and appends it to your document.</p>
              <button
                onClick={handleGenerateSummary}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Generate & Append Executive Summary</span>
              </button>
            </div>
          )}

          {/* Diagram */}
          {activeTab === 'diagram' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500">Creates instant Mermaid.js flowcharts, sequence diagrams, or ER diagrams.</p>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Diagram Type</label>
                <div className="grid grid-cols-3 gap-3 mt-1.5">
                  {(['flowchart', 'sequence', 'er'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setDiagramType(t)}
                      className={`p-2.5 rounded-lg border font-semibold uppercase ${
                        diagramType === t
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Title / Component Focus</label>
                <input
                  type="text"
                  value={diagramPrompt}
                  onChange={(e) => setDiagramPrompt(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 mt-1 text-slate-900 dark:text-white"
                />
              </div>

              <button
                onClick={handleInsertDiagram}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Network className="w-4 h-4" />
                <span>Insert Mermaid Diagram Code</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
