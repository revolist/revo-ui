/** Keep PDF.js (and its browser-only globals) out of initial UI/SSR imports. */
export async function loadPdfRuntime() {
  const pdf = await import('pdfjs-dist');
  // The generic viewer reads globalThis.pdfjsLib, set by the core build.
  const viewer = await import('pdfjs-dist/web/pdf_viewer.mjs');
  await import('pdfjs-dist/web/pdf_viewer.css');
  return { ...pdf, ...viewer };
}
export type PdfRuntime = Awaited<ReturnType<typeof loadPdfRuntime>>;
