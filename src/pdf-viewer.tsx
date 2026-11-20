import { h } from 'preact';
import { PdfViewer as __themeOriginal_PdfViewer } from '@revolist/ui/pdf-viewer';
import { Example } from './catalog';

import { createSamplePdf } from './sample-pdf';
import { withThemePreview } from './theme-preview';

const PdfViewer = withThemePreview(__themeOriginal_PdfViewer, 'PdfViewer');

export { createSamplePdf } from './sample-pdf';

const sample = createSamplePdf();
export function PdfViewerExamples() {
  return <>
    <Example title="PDF document viewer" wide>
      <PdfViewer source={sample} fileName="revogrid-product-brief.pdf" height={720} />
    </Example>
    <Example title="Start with a local document" wide>
      <PdfViewer height={360} toolbar={{ tools: ['open', 'navigation', 'zoom', 'download'],
        buttons: { zoomIn: false, zoomOut: false }, showPageCount: false,
        zoomLevels: ['page-width', 'page-fit', 1, 2] }} />
    </Example>
  </>;
}
