import { CoverPageConfig, HeaderFooterConfig, PageOrientation, PageSize, WatermarkConfig } from '@/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFExportOptions {
  element: HTMLElement;
  filename?: string;
  pageSize?: PageSize;
  orientation?: PageOrientation;
  coverPage?: CoverPageConfig;
  headerFooter?: HeaderFooterConfig;
  watermark?: WatermarkConfig;
}

/**
 * Client-side PDF exporter with smart element & list-item level page-break protection to prevent split letters/lines across page boundaries.
 */
export async function exportToPDF(options: PDFExportOptions): Promise<void> {
  const {
    element,
    filename = 'document.pdf',
    pageSize = 'a4',
    orientation = 'portrait',
  } = options;

  try {
    // 1. Measure and inject page-break spacers BEFORE elements or list items that cross page boundaries
    const cleanSpacers = injectSmartPageBreaks(element);

    // 2. Render Element to High-DPI Canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High DPI
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Clean up inserted spacers from DOM immediately
    cleanSpacers();

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;

    const pageHeightPx = (canvas.width * pageHeight) / pageWidth;
    const totalPages = Math.ceil(canvas.height / pageHeightPx);

    // Add Canvas Page Slices cleanly
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) pdf.addPage();

      const sourceY = page * pageHeightPx;
      const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

      // Create a temporary canvas slice for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;
      const ctx = pageCanvas.getContext('2d');

      if (ctx) {
        // Fill page background white
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF document');
  }
}

/**
 * Calculates printable page height in DOM pixels and inserts spacers before elements/list-items crossing page breaks.
 */
function injectSmartPageBreaks(element: HTMLElement): () => void {
  const containerRect = element.getBoundingClientRect();
  const containerWidth = containerRect.width;

  // Standard A4 aspect ratio (297mm / 210mm = 1.414)
  const pageHeightPx = containerWidth * 1.414;

  // Target every paragraph, list item, heading, table row, blockquote, code block, and image
  const targetSelector = 'h1, h2, h3, h4, h5, p, li, tr, pre, blockquote, img, .mermaid, .html-page-break';
  const nodes = Array.from(element.querySelectorAll<HTMLElement>(targetSelector));

  const addedSpacers: HTMLElement[] = [];

  nodes.forEach((node) => {
    // If element is a manual page break divider
    if (node.classList.contains('html-page-break')) {
      const nodeRect = node.getBoundingClientRect();
      const relativeTop = nodeRect.top - containerRect.top;
      const pageIndexTop = Math.floor(relativeTop / pageHeightPx);
      const nextPageTop = (pageIndexTop + 1) * pageHeightPx;
      const spacerHeight = nextPageTop - relativeTop;

      if (spacerHeight > 0) {
        const spacer = document.createElement('div');
        spacer.className = 'pdf-page-break-spacer';
        spacer.style.height = `${spacerHeight}px`;
        spacer.style.width = '100%';
        spacer.style.display = 'block';

        node.parentNode?.insertBefore(spacer, node);
        addedSpacers.push(spacer);
      }
      return;
    }

    const nodeRect = node.getBoundingClientRect();
    const relativeTop = nodeRect.top - containerRect.top;
    const relativeBottom = nodeRect.bottom - containerRect.top;

    const pageIndexTop = Math.floor(relativeTop / pageHeightPx);
    const pageIndexBottom = Math.floor(relativeBottom / pageHeightPx);

    // If element or list item straddles across a page break boundary, inject a spacer div before it
    if (pageIndexTop !== pageIndexBottom && nodeRect.height < pageHeightPx) {
      const nextPageTop = (pageIndexTop + 1) * pageHeightPx;
      const spacerHeight = nextPageTop - relativeTop + 12; // 12px padding buffer

      if (spacerHeight > 0 && spacerHeight < pageHeightPx * 0.95) {
        const spacer = document.createElement('div');
        spacer.className = 'pdf-page-break-spacer';
        spacer.style.height = `${spacerHeight}px`;
        spacer.style.width = '100%';
        spacer.style.display = 'block';

        node.parentNode?.insertBefore(spacer, node);
        addedSpacers.push(spacer);
      }
    }
  });

  // Return cleanup function to remove spacers after canvas capture
  return () => {
    addedSpacers.forEach((s) => s.parentNode?.removeChild(s));
  };
}
