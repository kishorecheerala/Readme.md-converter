'use client';

import { THEMES } from '@/lib/constants/themes';
import {
  CoverPageConfig,
  HeaderFooterConfig,
  PageOrientation,
  PageSize,
  ThemeId,
  WatermarkConfig
} from '@/types';
import {
  BookOpen,
  Check,
  Code2,
  FileCheck2,
  FileType,
  Image,
  Layout,
  Palette,
  Sliders,
  Sparkles,
  Type,
  X
} from 'lucide-react';
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  pageSize: PageSize;
  onPageSizeChange: (size: PageSize) => void;
  orientation: PageOrientation;
  onOrientationChange: (orientation: PageOrientation) => void;
  coverPage: CoverPageConfig;
  onCoverPageChange: (cfg: CoverPageConfig) => void;
  headerFooter: HeaderFooterConfig;
  onHeaderFooterChange: (cfg: HeaderFooterConfig) => void;
  watermark: WatermarkConfig;
  onWatermarkChange: (cfg: WatermarkConfig) => void;
  customCss: string;
  onCustomCssChange: (css: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  themeId,
  onThemeChange,
  pageSize,
  onPageSizeChange,
  orientation,
  onOrientationChange,
  coverPage,
  onCoverPageChange,
  headerFooter,
  onHeaderFooterChange,
  watermark,
  onWatermarkChange,
  customCss,
  onCustomCssChange,
}) => {
  const [activeCategory, setActiveCategory] = useState<'theme' | 'page' | 'cover' | 'header' | 'watermark' | 'css'>('theme');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Page, Theme & Document Customizer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-3 space-y-1 text-xs">
            <button
              onClick={() => setActiveCategory('theme')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'theme'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Theme Selector</span>
            </button>

            <button
              onClick={() => setActiveCategory('page')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'page'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Page Setup</span>
            </button>

            <button
              onClick={() => setActiveCategory('cover')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'cover'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Cover Page</span>
            </button>

            <button
              onClick={() => setActiveCategory('header')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'header'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <FileType className="w-4 h-4" />
              <span>Header & Footer</span>
            </button>

            <button
              onClick={() => setActiveCategory('watermark')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'watermark'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Watermark Overlay</span>
            </button>

            <button
              onClick={() => setActiveCategory('css')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeCategory === 'css'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Custom CSS</span>
            </button>
          </div>

          {/* Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Theme Selector */}
            {activeCategory === 'theme' && (
              <div className="grid grid-cols-2 gap-4">
                {Object.values(THEMES).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onThemeChange(t.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      themeId === t.id
                        ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: t.previewColor }}
                        />
                        {t.name}
                      </h4>
                      {themeId === t.id && (
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t.description}</p>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-slate-400">
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">{t.category}</span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm">{t.styles.fontFamily.split(',')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Page Setup */}
            {activeCategory === 'page' && (
              <div className="space-y-6 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                    Page Size Format
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {(['a4', 'letter', 'legal', 'a3'] as PageSize[]).map((sz) => (
                      <button
                        key={sz}
                        onClick={() => onPageSizeChange(sz)}
                        className={`p-3 rounded-lg border font-semibold uppercase ${
                          pageSize === sz
                            ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                    Page Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['portrait', 'landscape'] as PageOrientation[]).map((ori) => (
                      <button
                        key={ori}
                        onClick={() => onOrientationChange(ori)}
                        className={`p-3 rounded-lg border font-semibold capitalize ${
                          orientation === ori
                            ? 'border-blue-600 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {ori}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cover Page */}
            {activeCategory === 'cover' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Include Title Cover Page</span>
                  <input
                    type="checkbox"
                    checked={coverPage.enabled}
                    onChange={(e) => onCoverPageChange({ ...coverPage, enabled: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>

                {coverPage.enabled && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="font-medium text-slate-600 dark:text-slate-400">Document Title</label>
                      <input
                        type="text"
                        value={coverPage.title}
                        onChange={(e) => onCoverPageChange({ ...coverPage, title: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 mt-1 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 dark:text-slate-400">Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={coverPage.subtitle}
                        onChange={(e) => onCoverPageChange({ ...coverPage, subtitle: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 mt-1 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-slate-600 dark:text-slate-400">Author</label>
                        <input
                          type="text"
                          value={coverPage.author}
                          onChange={(e) => onCoverPageChange({ ...coverPage, author: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 mt-1 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-600 dark:text-slate-400">Version</label>
                        <input
                          type="text"
                          value={coverPage.version}
                          onChange={(e) => onCoverPageChange({ ...coverPage, version: e.target.value })}
                          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 mt-1 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 dark:text-slate-400">Abstract / Summary</label>
                      <textarea
                        value={coverPage.abstractText || ''}
                        onChange={(e) => onCoverPageChange({ ...coverPage, abstractText: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 mt-1 text-slate-900 dark:text-white h-20"
                        placeholder="Brief summary of document..."
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Header & Footer */}
            {activeCategory === 'header' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Header Bar</span>
                  <input
                    type="checkbox"
                    checked={headerFooter.enabledHeader}
                    onChange={(e) => onHeaderFooterChange({ ...headerFooter, enabledHeader: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>
                {headerFooter.enabledHeader && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Header Left Text"
                      value={headerFooter.headerLeft}
                      onChange={(e) => onHeaderFooterChange({ ...headerFooter, headerLeft: e.target.value })}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Header Right Text"
                      value={headerFooter.headerRight}
                      onChange={(e) => onHeaderFooterChange({ ...headerFooter, headerRight: e.target.value })}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg pt-4">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Footer Bar</span>
                  <input
                    type="checkbox"
                    checked={headerFooter.enabledFooter}
                    onChange={(e) => onHeaderFooterChange({ ...headerFooter, enabledFooter: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>
                {headerFooter.enabledFooter && (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Footer Left Text"
                      value={headerFooter.footerLeft}
                      onChange={(e) => onHeaderFooterChange({ ...headerFooter, footerLeft: e.target.value })}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Footer Right Text"
                      value={headerFooter.footerRight}
                      onChange={(e) => onHeaderFooterChange({ ...headerFooter, footerRight: e.target.value })}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Watermark Overlay */}
            {activeCategory === 'watermark' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Watermark Overlay</span>
                  <input
                    type="checkbox"
                    checked={watermark.enabled}
                    onChange={(e) => onWatermarkChange({ ...watermark, enabled: e.target.checked })}
                    className="w-4 h-4 accent-blue-600"
                  />
                </div>

                {watermark.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="font-medium text-slate-600 dark:text-slate-400">Watermark Text</label>
                      <input
                        type="text"
                        value={watermark.text}
                        onChange={(e) => onWatermarkChange({ ...watermark, text: e.target.value })}
                        className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 mt-1 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-medium text-slate-600 dark:text-slate-400">Opacity ({watermark.opacity})</label>
                        <input
                          type="range"
                          min="0.05"
                          max="0.4"
                          step="0.05"
                          value={watermark.opacity}
                          onChange={(e) => onWatermarkChange({ ...watermark, opacity: parseFloat(e.target.value) })}
                          className="w-full mt-2"
                        />
                      </div>
                      <div>
                        <label className="font-medium text-slate-600 dark:text-slate-400">Angle ({watermark.angle}°)</label>
                        <input
                          type="range"
                          min="-90"
                          max="90"
                          step="5"
                          value={watermark.angle}
                          onChange={(e) => onWatermarkChange({ ...watermark, angle: parseInt(e.target.value) })}
                          className="w-full mt-2"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Custom CSS */}
            {activeCategory === 'css' && (
              <div className="h-full flex flex-col">
                <p className="text-xs text-slate-500 mb-2">Inject custom CSS rules directly into the output document.</p>
                <textarea
                  value={customCss}
                  onChange={(e) => onCustomCssChange(e.target.value)}
                  className="flex-1 w-full bg-slate-950 text-emerald-400 font-mono text-xs p-3 rounded-lg border border-slate-800 min-h-[250px] outline-hidden"
                  placeholder="/* Example */\n.prose h1 { color: #2563eb; }"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
