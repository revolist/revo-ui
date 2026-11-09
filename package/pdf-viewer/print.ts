import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import { releasePreactElement } from '../preact-mount';
import {
  createPdfPrintFrame,
  createPdfPrintStyle,
  createPdfPrintCanvas,
} from './surfaces.view';

/** Render every page before opening print; printing is independent of the visible-page cache. */
export async function preparePdfPrint(
  pdf: PDFDocumentProxy,
  owner: Document,
  signal: AbortSignal,
  title = 'PDF print document',
) {
  signal.throwIfAborted();
  const frame = createPdfPrintFrame(owner, title);
  const canvases: HTMLCanvasElement[] = [];
  let style: HTMLStyleElement | undefined;
  let cleaned = false;
  owner.body.append(frame);
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    signal.removeEventListener('abort', cleanup);
    const printDocument = frame.contentDocument;
    canvases.forEach((canvas) => {
      canvas.width = 0;
      canvas.height = 0;
      releasePreactElement(canvas);
    });
    if (style) releasePreactElement(style);
    printDocument?.body.replaceChildren();
    releasePreactElement(frame);
  };
  signal.addEventListener('abort', cleanup, { once: true });
  let task: RenderTask | undefined;
  const cancel = () => task?.cancel();
  signal.addEventListener('abort', cancel, { once: true });
  try {
    const document = frame.contentDocument;
    if (!document) throw new Error('Unable to prepare the print document');
    style = createPdfPrintStyle(document);
    document.head.append(style);
    for (let number = 1; number <= pdf.numPages; number++) {
      signal.throwIfAborted();
      const page = await pdf.getPage(number);
      signal.throwIfAborted();
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(
        2,
        Math.sqrt(16_000_000 / (base.width * base.height)),
      );
      const viewport = page.getViewport({ scale });
      const canvas = createPdfPrintCanvas(
        document,
        Math.ceil(viewport.width),
        Math.ceil(viewport.height),
      );
      canvases.push(canvas);
      document.body.append(canvas);
      task = page.render({ canvas, viewport, intent: 'print' });
      await task.promise;
    }
    signal.throwIfAborted();
    frame.contentWindow!.addEventListener('afterprint', cleanup, {
      once: true,
    });
    frame.contentWindow!.focus();
    frame.contentWindow!.print();
  } catch (error) {
    cleanup();
    throw error;
  } finally {
    signal.removeEventListener('abort', cancel);
  }
  return cleanup;
}
