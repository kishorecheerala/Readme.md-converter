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
 * Client-side PDF exporter converting rendered DOM element into high-DPI PDF document.
 */
export async function exportToPDF(options: PDFExportOptions): Promise<void> {
  const {
    element,
    filename = 'document.pdf',
    pageSize = 'a4',
    orientation = 'portrait',
  } = options;

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High DPI (300 DPI equivalent)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: pageSize,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add subsequent pages if canvas exceeds single page height
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF document');
  }
}
