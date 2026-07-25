# 🚀 Readme.md Converter — Professional Document & PDF Studio

![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-cyan)
![License](https://img.shields.io/badge/license-MIT-purple)
![Vercel Ready](https://img.shields.io/badge/Vercel-Production%20Ready-brightgreen)

> **Developed by**: Kishore Cheerala  
> ✉️ **Reach out for features/suggestions**: [cheeralakishore@gmail.com](mailto:cheeralakishore@gmail.com)

**Readme.md Converter** is a modern, high-performance web application built to convert any `README.md` or Markdown file into beautifully formatted **PDF**, **DOCX**, **HTML**, and **Clean Markdown** documents.

---

## 🌟 Key Features

- 📄 **Multi-Format Export**: High-DPI PDF (A4, Letter, Legal, Landscape), native Word `.docx`, standalone styled HTML, and sanitized Markdown.
- 🎨 **11 Professional Themes**:
  - *Classic Documentation*
  - *GitHub Style*
  - *Corporate Strategy Report*
  - *Academic Research Paper*
  - *Dark Mode PDF*
  - *Minimalist*
  - *Modern Tech*
  - *Book Style*
  - *Executive Resume*
  - *Google Docs Style*
  - *Microsoft Word Style*
- 🐙 **GitHub Repository Importer**: Import README and repository metadata (stars, forks, license, badges, raw image URLs) directly from any GitHub URL (`https://github.com/owner/repo`).
- 🤖 **AI Document Intelligence Studio**:
  - **AI Quality Analyzer**: Readability, heading structure, missing sections, WCAG accessibility, and SEO scoring.
  - **AI Format Beautifier**: Auto-fixes markdown spaces, list indentations, and table alignment.
  - **AI Summary Generator**: Auto-generates Executive Summary and TL;DR.
  - **AI Diagram Generator**: Text-to-Mermaid flowchart, sequence, and ER diagram generation.
- 📐 **Math & Diagram Support**: KaTeX math formulas ($e=mc^2$) and Mermaid.js diagrams.
- 🖼️ **Document Customizer**: Customizable cover page (logo, title, subtitle, author, abstract), headers/footers with page numbering, watermark overlays, and custom CSS injection.
- 📊 **Productivity Suite**: Live split-screen workspace, section reordering, markdown diff comparison view, and document statistics.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
- **Markdown & Diagram Engine**: Unified, Remark, Rehype, Highlight.js, KaTeX, Mermaid.js.
- **Document Exporters**: jsPDF, html2canvas, docx.
- **Testing & Deployment**: Jest, ts-jest, Docker, GitHub Actions CI/CD, Vercel Serverless Functions.

---

## 🚀 Quick Start & Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Automated Tests

```bash
npm test
```

### 4. Build Production Bundle

```bash
npm run build
```

---

## 🐳 Docker Support

To run the application using Docker:

```bash
docker-compose up --build
```

Access the application at `http://localhost:3000`.

---

## ⚡ API Endpoints

- `POST /api/convert/docx` — Convert Markdown to Word `.docx` document.
- `POST /api/convert/html` — Convert Markdown to standalone HTML document.
- `POST /api/github/import` — Fetch repository README and metadata.
- `POST /api/ai/analyze` — Document quality & readability scoring API.
- `POST /api/ai/beautify` — AI Markdown beautifier API.
- `POST /api/ai/summary` — Generate executive summary API.
- `POST /api/ai/diagram` — Generate Mermaid diagram API.

---

## ☁️ Vercel Deployment

DocuCraft Pro is pre-configured for **1-click Vercel deployment**:

1. Push code to GitHub.
2. Import project into Vercel Dashboard.
3. Vercel automatically detects Next.js framework settings and deploys via edge & serverless runtimes.

---

## 📄 License

This project is licensed under the MIT License.
