import { h } from 'preact';
import { PdfViewer } from '@revolist/ui/pdf-viewer';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Example } from './catalog';

import { createSamplePdf } from './sample-pdf';
export { createSamplePdf } from './sample-pdf';

const sample = createSamplePdf();
export function PdfViewerExamples() {
  return <>
    <Example title="PDF document viewer" wide>
      <PdfViewer source={sample} workerSrc={workerSrc} fileName="revogrid-product-brief.pdf" height={720} />
    </Example>
    <Example title="Start with a local document" wide>
      <PdfViewer workerSrc={workerSrc} height={360} toolbar={{ tools: ['open', 'navigation', 'zoom', 'download'],
        buttons: { zoomIn: false, zoomOut: false }, showPageCount: false,
        zoomLevels: ['page-width', 'page-fit', 1, 2] }} />
    </Example>
  </>;
}
