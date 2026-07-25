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
import { Eye, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
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

  const isDarkTableHeader = themeId === 'word' || themeId === 'corporate' || themeId === 'dark';

  return (
    <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* Preview Toolbar */}
      <div className="h-10 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-xs">
        <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            Live Document Preview
          </span>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="uppercase font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-[10px]">
            {pageSize} • {orientation}
          </span>
          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold px-2.5 py-0.5 rounded-md">
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
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-200/90 dark:bg-slate-950">
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
              padding: '40px',
              boxSizing: 'border-box',
              boxShadow: theme.styles.shadow,
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
              <div className="border-b border-slate-200 dark:border-slate-700 pb-3 mb-8 flex justify-between text-xs text-slate-400 font-mono tracking-wider uppercase">
                <span>{headerFooter.headerLeft}</span>
                <span>{headerFooter.headerRight}</span>
              </div>
            )}

            {/* Cover Page */}
            {coverPage.enabled && (
              <div className="min-h-[900px] flex flex-col justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-12 mb-12 text-center">
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
                    style={{ color: theme.styles.headingColor, fontFamily: theme.styles.headingFontFamily }}
                  >
                    {coverPage.title || 'Document Title'}
                  </h1>
                  {coverPage.subtitle && (
                    <p className="text-xl text-slate-500 italic max-w-xl mx-auto font-serif">
                      {coverPage.subtitle}
                    </p>
                  )}
                </div>

                {coverPage.abstractText && (
                  <div className="max-w-xl mx-auto my-8 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-left text-sm text-slate-600 dark:text-slate-300 border-l-4 border-blue-500 shadow-xs">
                    <h4 className="font-bold text-xs uppercase text-blue-600 tracking-wider mb-1.5">Executive Summary</h4>
                    <p className="leading-relaxed">{coverPage.abstractText}</p>
                  </div>
                )}

                <div className="text-sm space-y-1.5 text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-6 max-w-md mx-auto">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Author: {coverPage.author || 'Author Name'}
                  </p>
                  <p>Date: {coverPage.date || new Date().toLocaleDateString()}</p>
                  <p>Version: {coverPage.version || '1.0.0'}</p>
                  {coverPage.confidentialLabel && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-md tracking-wider">
                      {coverPage.confidentialLabel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Document Content Rendered HTML */}
            <div
              className="prose max-w-none break-words document-render-content"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />

            {/* Premium Document & Page Break Styling Engine */}
            <style jsx global>{`
              #pdf-render-target * {
                box-sizing: border-box;
              }
              /* Strip Tailwind typography auto-injected backticks around code tags */
              .document-render-content code::before,
              .document-render-content code::after,
              .prose code::before,
              .prose code::after {
                content: "" !important;
                display: none !important;
              }
              .document-render-content {
                font-family: ${theme.styles.fontFamily};
                color: ${theme.styles.textColor} !important;
                line-height: ${theme.styles.lineHeight};
              }
              .document-render-content > *:first-child,
              .document-render-content h1:first-child,
              .document-render-content h2:first-child,
              .document-render-content p:first-child {
                margin-top: 0 !important;
                padding-top: 0 !important;
              }
              .document-render-content strong,
              .document-render-content b {
                color: ${theme.styles.headingColor || theme.styles.textColor} !important;
                font-weight: 700;
              }
              .document-render-content h1,
              .document-render-content h2,
              .document-render-content h3,
              .document-render-content h4,
              .document-render-content p,
              .document-render-content li,
              .document-render-content tr,
              .document-render-content pre,
              .document-render-content blockquote,
              .document-render-content img,
              .document-render-content .mermaid {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              .document-render-content h1 {
                font-family: ${theme.styles.headingFontFamily || theme.styles.fontFamily};
                color: ${theme.styles.headingColor} !important;
                font-size: 2.1em;
                font-weight: 800;
                letter-spacing: -0.02em;
                margin-top: 1.2em;
                margin-bottom: 0.6em;
                padding-bottom: 0.4em;
                border-bottom: 2px solid ${theme.styles.borderColor};
                line-height: 1.35;
                word-break: break-word;
                overflow: visible;
              }
              .document-render-content h2 {
                font-family: ${theme.styles.headingFontFamily || theme.styles.fontFamily};
                color: ${theme.styles.headingColor} !important;
                font-size: 1.5em;
                font-weight: 700;
                letter-spacing: -0.01em;
                margin-top: 1.1em;
                margin-bottom: 0.5em;
                padding-bottom: 0.35em;
                border-bottom: 1px solid ${theme.styles.borderColor};
                line-height: 1.35;
                word-break: break-word;
                overflow: visible;
              }
              .document-render-content h3 {
                font-family: ${theme.styles.headingFontFamily || theme.styles.fontFamily};
                color: ${theme.styles.headingColor} !important;
                font-size: 1.25em;
                font-weight: 600;
                margin-top: 0.9em;
                margin-bottom: 0.4em;
                line-height: 1.35;
                word-break: break-word;
              }
              .document-render-content h4 {
                font-family: ${theme.styles.headingFontFamily || theme.styles.fontFamily};
                color: ${theme.styles.headingColor} !important;
                font-size: 1.1em;
                font-weight: 600;
                margin-top: 0.8em;
                margin-bottom: 0.35em;
                line-height: 1.35;
              }
              .document-render-content hr + h1,
              .document-render-content hr + h2,
              .document-render-content hr + h3,
              .document-render-content hr + h4 {
                margin-top: 0.4em !important;
              }
              .document-render-content p {
                color: ${theme.styles.textColor} !important;
                margin-bottom: 1em;
                line-height: ${theme.styles.lineHeight};
                word-break: break-word;
                overflow-wrap: break-word;
              }
              .document-render-content ul,
              .document-render-content ol {
                color: ${theme.styles.textColor} !important;
                margin-bottom: 1em;
                padding-left: 1.5em;
              }
              .document-render-content li {
                color: ${theme.styles.textColor} !important;
                margin-bottom: 0.3em;
                line-height: 1.65;
                word-break: break-word;
              }
              .document-render-content a {
                color: ${theme.styles.accentColor} !important;
                font-weight: 500;
                text-decoration: underline;
                text-underline-offset: 3px;
                word-break: break-all;
              }
              .document-render-content code {
                font-family: ${theme.styles.codeFontFamily || 'monospace'};
                background-color: ${theme.styles.codeBg};
                color: ${theme.styles.codeTextColor} !important;
                padding: 0.2em 0.4em;
                border-radius: 5px;
                font-size: 0.88em;
                border: 1px solid ${theme.styles.borderColor};
              }
              .document-render-content pre {
                font-family: ${theme.styles.codeFontFamily || 'monospace'};
                background-color: ${theme.styles.codeBg};
                border: 1px solid ${theme.styles.borderColor};
                border-radius: 10px;
                padding: 1em 1.25em;
                margin: 1.2em 0;
                white-space: pre !important;
                word-break: normal !important;
                word-wrap: normal !important;
                font-size: 0.84em;
                line-height: 1.38;
                overflow-x: auto;
                max-width: 100%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.03);
              }
              .document-render-content pre code {
                font-family: inherit;
                background: none;
                border: none;
                padding: 0;
                color: ${theme.styles.codeTextColor} !important;
                white-space: pre !important;
                word-break: normal !important;
                word-wrap: normal !important;
                font-size: inherit;
                line-height: inherit;
              }
              .document-render-content blockquote {
                background-color: ${theme.styles.blockquoteBg};
                border-left: 4px solid ${theme.styles.blockquoteBorderColor};
                color: ${theme.styles.textColor} !important;
                margin: 1.2em 0;
                padding: 0.8em 1.1em;
                border-radius: 0 10px 10px 0;
                font-style: italic;
                word-break: break-word;
              }
              .document-render-content table {
                width: 100% !important;
                max-width: 100% !important;
                border-collapse: collapse !important;
                margin: 1.4em 0 !important;
                word-break: break-word !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              .document-render-content table tr {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
              .document-render-content table th {
                background-color: ${theme.styles.tableHeaderBg};
                color: ${isDarkTableHeader ? '#ffffff' : theme.styles.headingColor} !important;
                font-weight: 700;
                font-size: 0.85em;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                padding: 0.8em 1em;
                border: 1px solid ${theme.styles.borderColor} !important;
                text-align: left;
              }
              .document-render-content table td {
                color: ${theme.styles.textColor} !important;
                padding: 0.7em 1em;
                border: 1px solid ${theme.styles.borderColor} !important;
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
                font-size: 0.94em;
              }
              .document-render-content table tr:nth-child(even) {
                background-color: ${theme.styles.tableAltRowBg};
              }
              .document-render-content hr {
                border: none;
                height: 1px;
                background-color: ${theme.styles.borderColor};
                margin: 1.2em 0;
              }
              .document-render-content img {
                max-width: 100% !important;
                height: auto !important;
                border-radius: 8px;
                display: inline-block;
                vertical-align: middle;
                margin: 0.4em 0.2em;
              }
              .document-render-content .mermaid {
                max-width: 100% !important;
                overflow-x: auto;
                margin: 2em 0;
                padding: 1em;
                background-color: ${theme.styles.codeBg};
                border-radius: 10px;
                border: 1px solid ${theme.styles.borderColor};
              }
              .document-render-content .html-page-break {
                page-break-before: always !important;
                break-before: page !important;
                height: 24px;
                border-top: 2px dashed #2563eb;
                margin: 32px 0;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .document-render-content .html-page-break::after {
                content: '--- PAGE BREAK ---';
                font-family: monospace;
                font-size: 10px;
                font-weight: bold;
                color: #2563eb;
                background: #eff6ff;
                padding: 2px 8px;
                border-radius: 4px;
                border: 1px solid #bfdbfe;
              }
              ${customCss}
            `}</style>

            {/* Footer */}
            {headerFooter.enabledFooter && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-12 flex justify-between items-center text-xs text-slate-400 font-mono tracking-wider">
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
