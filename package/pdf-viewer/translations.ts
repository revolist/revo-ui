export const defaultPdfViewerText = {
  viewer: 'PDF document',
  pages: 'Document pages',
  toolbar: 'PDF tools',
  first: 'First page',
  last: 'Last page',
  open: 'Open PDF',
  previous: 'Previous page',
  next: 'Next page',
  zoomPercentage: '{percent}%',
  page: 'Page',
  of: 'of',
  zoom: 'Zoom',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  fitWidth: 'Fit width',
  fitPage: 'Fit page',
  rotate: 'Rotate clockwise',
  search: 'Find in document',
  previousMatch: 'Previous match',
  nextMatch: 'Next match',
  closeSearch: 'Close search',
  matches: 'matches',
  noMatches: 'No matches',
  searching: 'Searching…',
  download: 'Download PDF',
  print: 'Print PDF',
  printing: 'Preparing print…',
  loading: 'Loading PDF…',
  empty: 'Open a PDF to get started',
  emptyHint: 'View, search, print and download your document.',
  errorDescription: 'Check the document and try again.',
  operationError: 'Unable to complete the PDF operation. Try again.',
  printDocument: 'PDF print document',
  pageCount: '{of} {pages}',
  pageSummary: '{page} {of} {pages}',
  matchSummary: '{match} / {total} {matches}',
  error: 'Unable to display this PDF',
  retry: 'Retry',
  more: 'More PDF tools',
  cancelPrint: 'Cancel printing',
};
export type PdfViewerText = typeof defaultPdfViewerText;

/** Substitute known tokens without changing document/user text. */
export function formatPdfText(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (token, key: string) =>
    String(values[key] ?? token),
  );
}

export function resolvePdfViewerText(
  text?: Partial<PdfViewerText>,
): PdfViewerText {
  return {
    ...defaultPdfViewerText,
    ...Object.fromEntries(
      Object.entries(text ?? {}).filter(
        ([, value]) => typeof value === 'string',
      ),
    ),
  };
}
