import { createSamplePdf } from '../../../../src/sample-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PdfViewerProps } from '@revolist/ui/pdf-viewer';
export const sample = createSamplePdf();
export const pdfProps = (configured = false): PdfViewerProps => ({
  workerSrc,
  source: sample,
  height: 400,
  fileName: configured ? 'updated.pdf' : 'initial.pdf',
  text: configured
    ? { next: 'Page suivante', toolbar: 'Outils PDF', search: 'Rechercher' }
    : {},
  toolbar: configured
    ? {
        buttons: { rotate: false, print: false },
        zoomLevels: ['page-fit', 1, 2],
      }
    : undefined,
});
