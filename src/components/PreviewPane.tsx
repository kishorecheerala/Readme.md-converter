'use client';

import { THEMES } from '@/lib/constants/themes';
import { parseMarkdownToHtml } from '@/lib/markdown/parser';
import {
  CoverPageConfig,
  HeaderFooterConfig,
  PageOrientation,
  PageSize,
  ThemeId,
  WatermarkConfig
} from '@/types';
import { Eye, FileText, Layout, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface PreviewPaneProps {
  markdown: string;
  themeId: ThemeId;
  pageSize: PageSize;
  orientation: PageOrientation;
  coverPage: CoverPageConfig;
  headerFooter: HeaderFooterConfig;
  watermark: WatermarkConfig;
  customCss?: string;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  markdown,
  themeId,
  pageSize,
  orientation,
  coverPage,
  headerFooter,
  watermark,
  customCss = '',
}) => {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [zoom, setZoom] = useState<number>(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = THEMES[themeId] || THEMES.classic;

  // Render markdown to HTML
  useEffect(() => {
    let isMounted = true;
    parseMarkdownToHtml(markdown).then((html) => {
      if (isMounted) setRenderedHtml(html);
    });
    return () => {
      isMounted = false;
    };
  }, [markdown]);

  // Trigger client-side Mermaid rendering
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).mermaid) {
      try {
        (window as any).mermaid.contentLoaded();
      } catch (err) {
        // ignore mermaid re-render glitch
      }
    }
  }, [renderedHtml]);

  // Map Page Dimensions
  const getPageDimensions = () => {
    const isLandscape = orientation === 'landscape';
    if (pageSize === 'letter') return isLandscape ? 'w-[1056px]' : 'w-[816px]';
    if (pageSize === 'legal') return isLandscape ? 'w-[1344px]' : 'w-[816px]';
    if (pageSize === 'a3') return isLandscape ? 'w-[1587px]' : 'w-[1122px]';
    // default A4
    return isLandscape ? 'w-[1122px]' : 'w-[794px]';
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Preview Toolbar */}
      <div className="h-10 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1 font-semibold">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            Live Document Preview
          </span>
          <span className="text-slate-400">|</span>
          <span className="uppercase font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
            {pageSize} • {orientation}
          </span>
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium px-2 py-0.5 rounded-md">
            {theme.name}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-slate-600 dark:text-slate-400 w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-md"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-md"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document Viewport Wrapper */}
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-200/80 dark:bg-slate-950">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="transition-transform duration-200"
        >
          {/* Printable Page Paper Box */}
          <div
            id="pdf-render-target"
            ref={containerRef}
            className={`relative bg-white text-slate-900 shadow-2xl rounded-sm transition-all duration-300 min-h-[1123px] overflow-hidden ${getPageDimensions()}`}
            style={{
              fontFamily: theme.styles.fontFamily,
              fontSize: theme.styles.fontSize,
              lineHeight: theme.styles.lineHeight,
              backgroundColor: theme.styles.backgroundColor,
              color: theme.styles.textColor,
              padding: theme.styles.padding,
              boxSizing: 'border-box',
            }}
          >
            {/* Watermark Overlay */}
            {watermark.enabled && watermark.text && (
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-20"
                style={{
                  opacity: watermark.opacity,
                  transform: `rotate(${watermark.angle}deg)`,
                  color: watermark.color,
                  fontSize: `${watermark.fontSize}px`,
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                  userSelect: 'none',
                }}
              >
                {watermark.text}
              </div>
            )}

            {/* Header */}
            {headerFooter.enabledHeader && (
              <div className="border-b border-slate-200 dark:border-slate-700 pb-2 mb-6 flex justify-between text-xs text-slate-400 font-mono">
                <span>{headerFooter.headerLeft}</span>
                <span>{headerFooter.headerRight}</span>
              </div>
            )}

            {/* Cover Page */}
            {coverPage.enabled && (
              <div className="min-h-[900px] flex flex-col justify-between border-b-2 border-slate-200 pb-12 mb-12 text-center">
                <div className="pt-16">
                  {coverPage.logoUrl && (
                    <img
                      src={coverPage.logoUrl}
                      alt="Logo"
                      className="h-16 mx-auto mb-6 object-contain"
                    />
                  )}
                  <h1
                    className="text-4xl font-extrabold tracking-tight mb-4"
                    style={{ color: theme.styles.headingColor }}
                  >
                    {coverPage.title || 'Document Title'}
                  </h1>
                  {coverPage.subtitle && (
                    <p className="text-xl text-slate-500 italic max-w-xl mx-auto">
                      {coverPage.subtitle}
                    </p>
                  )}
                </div>

                {coverPage.abstractText && (
                  <div className="max-w-xl mx-auto my-8 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-left text-sm text-slate-600 dark:text-slate-300 border-l-4 border-blue-500">
                    <h4 className="font-bold text-xs uppercase text-blue-600 mb-1">Abstract</h4>
                    <p>{coverPage.abstractText}</p>
                  </div>
                )}

                <div className="text-sm space-y-1 text-slate-500 border-t border-slate-200 pt-6 max-w-md mx-auto">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Author: {coverPage.author || 'Author Name'}
                  </p>
                  <p>Date: {coverPage.date || new Date().toLocaleDateString()}</p>
                  <p>Version: {coverPage.version || '1.0.0'}</p>
                  {coverPage.confidentialLabel && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-md">
                      {coverPage.confidentialLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Document Content Rendered HTML */}
            <div
              className="prose max-w-none dark:prose-invert break-words"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            {/* Custom Theme & Overflow Prevention CSS */}
            <style jsx global>{`
              #pdf-render-target * {
                box-sizing: border-box;
              }
              #pdf-render-target h1,
              #pdf-render-target h2,
              #pdf-render-target h3,
              #pdf-render-target h4 {
                font-family: ${theme.styles.headingFontFamily || theme.styles.fontFamily};
                color: ${theme.styles.headingColor};
                word-break: break-word;
              }
              #pdf-render-target p,
              #pdf-render-target li {
                word-break: break-word;
                overflow-wrap: break-word;
              }
              #pdf-render-target a {
                color: ${theme.styles.accentColor};
                word-break: break-all;
              }
              #pdf-render-target code {
                font-family: ${theme.styles.codeFontFamily || 'monospace'};
                background-color: ${theme.styles.codeBg};
                color: ${theme.styles.codeTextColor};
                word-break: break-word;
              }
              #pdf-render-target pre {
                background-color: ${theme.styles.codeBg};
                border-color: ${theme.styles.borderColor};
                white-space: pre-wrap !important;
                word-break: break-word !important;
                word-wrap: break-word !important;
                overflow-x: auto;
                max-width: 100%;
              }
              #pdf-render-target pre code {
                white-space: pre-wrap !important;
                word-break: break-word !important;
              }
              #pdf-render-target blockquote {
                background-color: ${theme.styles.blockquoteBg};
                border-left-color: ${theme.styles.blockquoteBorderColor};
                word-break: break-word;
              }
              #pdf-render-target table {
                width: 100% !important;
                max-width: 100% !important;
                table-layout: auto !important;
                border-collapse: collapse;
                margin: 1.5em 0;
                word-break: break-word !important;
              }
              #pdf-render-target table th,
              #pdf-render-target table td {
                border: 1px solid ${theme.styles.borderColor};
                padding: 0.6em 0.8em;
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
              }
              #pdf-render-target table th {
                background-color: ${theme.styles.tableHeaderBg};
              }
              #pdf-render-target table tr:nth-child(even) {
                background-color: ${theme.styles.tableAltRowBg};
              }
              #pdf-render-target img {
                max-width: 100% !important;
                height: auto !important;
              }
              #pdf-render-target .mermaid {
                max-width: 100% !important;
                overflow-x: auto;
              }
              ${customCss}
            `}</style>

            {/* Footer */}
            {headerFooter.enabledFooter && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-12 flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>{headerFooter.footerLeft}</span>
                {headerFooter.showPageNumbers && <span>Page 1</span>}
                <span>{headerFooter.footerRight}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
