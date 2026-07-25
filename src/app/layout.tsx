import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Readme.md Converter - Professional PDF & DOCX Document Studio',
  description: 'Convert any README.md or Markdown file into beautifully formatted PDF, DOCX, and HTML documents. Developed by Kishore Cheerala.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-icon',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Georgia&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css"
        />
        <script src="https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `if (typeof window !== 'undefined' && window.mermaid) { window.mermaid.initialize({ startOnLoad: true, theme: 'dark' }); }`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
