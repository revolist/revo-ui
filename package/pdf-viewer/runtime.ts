/** Keep PDF.js (and its browser-only globals) out of initial UI/SSR imports. */
export async function loadPdfRuntime() {
  const pdf = await import('pdfjs-dist');
  // The generic viewer reads globalThis.pdfjsLib, set by the core build.
  const viewer = await import('pdfjs-dist/web/pdf_viewer.mjs');
  // PDF.js sets a document-wide color scheme, which otherwise changes native
  // controls and scrollbars outside the viewer when the host uses another theme.
  const { default: css } = await import('pdfjs-dist/web/pdf_viewer.css?inline');
  if (!document.getElementById('rv-pdfjs-viewer-styles')) {
    const style = document.createElement('style');
    style.id = 'rv-pdfjs-viewer-styles';
    style.textContent = css.replace(/(:root\s*\{\s*)color-scheme:\s*light dark\s*;/, '$1');
    document.head.append(style);
  }
  return { ...pdf, ...viewer };
}
export type PdfRuntime = Awaited<ReturnType<typeof loadPdfRuntime>>;
