import type { PdfSource, PdfZoom } from './types';

export function normalizePdfZoom(zoom: PdfZoom): PdfZoom {
  if (zoom === 'page-fit' || zoom === 'page-width') return zoom;
  return Number.isFinite(zoom) ? Math.min(5, Math.max(0.25, zoom)) : 1;
}
export function normalizePdfPage(page: number, count: number): number {
  return Math.min(Math.max(1, count), Math.max(1, Math.trunc(page) || 1));
}
export function pdfFileName(source?: PdfSource | null, name?: string): string {
  const candidate =
    name ||
    (typeof File !== 'undefined' && source instanceof File
      ? source.name
      : '') ||
    (typeof source === 'string'
      ? source.split(/[?#]/)[0].split('/').pop()
      : '') ||
    'document.pdf';
  let decoded: string;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    decoded = candidate;
  }
  const safe = decoded.replace(/[\\/\x00-\x1f]/g, '_');
  return /\.pdf$/i.test(safe) ? safe : `${safe}.pdf`;
}
/** PDF.js transfers typed arrays to its worker. Never detach caller-owned data. */
export async function pdfSourceParameters(source: PdfSource) {
  if (typeof source === 'string') return { url: source };
  const bytes = source instanceof Blob ? await source.arrayBuffer() : source;
  return {
    data:
      bytes instanceof Uint8Array
        ? bytes.slice()
        : new Uint8Array(bytes.slice(0)),
  };
}
