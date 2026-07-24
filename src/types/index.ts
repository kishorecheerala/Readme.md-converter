export type ExportFormat = 'pdf' | 'docx' | 'html' | 'md';

export type PageSize = 'a4' | 'letter' | 'legal' | 'a3';

export type PageOrientation = 'portrait' | 'landscape';

export type MarginPreset = 'normal' | 'compact' | 'wide' | 'custom';

export interface CustomMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type FontFamily =
  | 'Inter'
  | 'Roboto'
  | 'Arial'
  | 'Calibri'
  | 'Times New Roman'
  | 'Georgia'
  | 'JetBrains Mono';

export type SyntaxTheme =
  | 'github'
  | 'vs2015'
  | 'monokai'
  | 'atom-one-dark'
  | 'nord'
  | 'dracula';

export type ThemeId =
  | 'classic'
  | 'github'
  | 'corporate'
  | 'academic'
  | 'dark'
  | 'minimal'
  | 'modern'
  | 'book'
  | 'resume'
  | 'google-docs'
  | 'word';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  category: string;
  previewColor: string;
  styles: {
    fontFamily: string;
    headingFontFamily?: string;
    codeFontFamily?: string;
    fontSize: string;
    lineHeight: string;
    backgroundColor: string;
    textColor: string;
    headingColor: string;
    accentColor: string;
    codeBg: string;
    codeTextColor: string;
    borderColor: string;
    tableHeaderBg: string;
    tableAltRowBg: string;
    blockquoteBg: string;
    blockquoteBorderColor: string;
    shadow: string;
    padding: string;
  };
}

export interface CoverPageConfig {
  enabled: boolean;
  title: string;
  subtitle: string;
  author: string;
  version: string;
  date: string;
  logoUrl?: string;
  repositoryUrl?: string;
  confidentialLabel?: string;
  abstractText?: string;
  themeStyle: 'standard' | 'minimal' | 'corporate' | 'academic';
}

export interface HeaderFooterConfig {
  enabledHeader: boolean;
  enabledFooter: boolean;
  headerLeft: string;
  headerRight: string;
  footerLeft: string;
  footerRight: string;
  showPageNumbers: boolean;
  showCoverPageNumbers: boolean;
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  opacity: number; // 0 to 1
  color: string;
  angle: number; // e.g. -45
  fontSize: number;
}

export interface BrandingProfile {
  id: string;
  name: string;
  logoUrl: string;
  companyName: string;
  defaultAuthor: string;
  headerText: string;
  footerText: string;
  primaryColor: string;
  watermarkText: string;
}

export interface DocumentStats {
  words: number;
  characters: number;
  readingTimeMinutes: number;
  headingsCount: number;
  codeBlocksCount: number;
  tablesCount: number;
  imagesCount: number;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface GitHubRepoMetadata {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  license: string;
  version: string;
  owner: string;
  repo: string;
  rawReadme: string;
  defaultBranch: string;
}

export interface AIAnalysisResult {
  overallScore: number;
  categories: {
    readability: { score: number; feedback: string };
    structure: { score: number; feedback: string };
    documentationQuality: { score: number; feedback: string };
    missingSections: { score: number; items: string[] };
    accessibility: { score: number; feedback: string };
    seo: { score: number; feedback: string };
  };
  recommendations: string[];
}

export interface SectionItem {
  id: string;
  heading: string;
  level: number;
  content: string;
}
