import type { DocumentInitParameters } from 'pdfjs-dist/types/src/display/api';

export type PdfSource = string | Uint8Array | ArrayBuffer | Blob;
export type PdfZoom = number | 'page-width' | 'page-fit';
export type PdfViewerTool =
  | 'open'
  | 'navigation'
  | 'zoom'
  | 'rotate'
  | 'search'
  | 'download'
  | 'print';
export interface PdfViewerState {
  status: 'empty' | 'loading' | 'ready' | 'error';
  fileName: string;
  page: number;
  pageCount: number;
  zoom: PdfZoom;
  scale: number;
  rotation: number;
  query: string;
  match: number;
  matchCount: number;
  searching: boolean;
  printing: boolean;
  error: Error | null;
}
export interface PdfViewerOptions {
  /** URL of the matching pdfjs-dist/build/pdf.worker.min.mjs, served by your app. */
  workerSrc: string;
  /** PDF.js localization service for page accessibility and annotation content. */
  l10n?: ConstructorParameters<
    typeof import('pdfjs-dist/web/pdf_viewer.mjs').PDFViewer
  >[0]['l10n'];
  source?: PdfSource | null;
  fileName?: string;
  initialPage?: number;
  initialZoom?: PdfZoom;
  /** Asset URLs, authentication, password and other PDF.js loading options. */
  documentOptions?: Omit<DocumentInitParameters, 'url' | 'data' | 'worker'>;
  onLoad?: (details: { pageCount: number; fileName: string }) => void;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: PdfZoom, scale: number) => void;
  onError?: (error: Error) => void;
}
