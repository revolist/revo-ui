import { beforeEach, expect, it, vi } from 'vitest';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { preparePdfPrint } from './print';
import type { Window } from 'happy-dom';
beforeEach(() => {
  const settings = (window as unknown as Window).happyDOM.settings;
  settings.enableIframePageLoading = true;
  settings.disableIframePageLoading = false;
});

it('cancels print preparation and removes its frame when the document is replaced', async () => {
  let resolvePage!: (page: unknown) => void;
  const pdf = {
    numPages: 3,
    getPage: vi.fn(
      () =>
        new Promise((resolve) => {
          resolvePage = resolve;
        }),
    ),
  };
  const abort = new AbortController();
  const pending = preparePdfPrint(
    pdf as unknown as PDFDocumentProxy,
    document,
    abort.signal,
    'Document à imprimer',
  );
  const frame = document.querySelector('iframe')!;
  expect(frame).not.toBeNull();
  expect(frame.title).toBe('Document à imprimer');
  abort.abort();
  resolvePage({});
  await expect(pending).rejects.toThrow();
  expect(frame.isConnected).toBe(false);
  expect(pdf.getPage).toHaveBeenCalledTimes(1);
});

it('cleans up a frame when a page cannot be printed', async () => {
  const pdf = {
    numPages: 1,
    getPage: vi.fn(async () => {
      throw new Error('Page unavailable');
    }),
  };
  await expect(
    preparePdfPrint(
      pdf as unknown as PDFDocumentProxy,
      document,
      new AbortController().signal,
    ),
  ).rejects.toThrow('Page unavailable');
  expect(document.querySelector('iframe')).toBeNull();
});

it('does not create a print frame after cancellation', async () => {
  const abort = new AbortController();
  abort.abort();
  const pdf = { numPages: 0 } as PDFDocumentProxy;
  await expect(preparePdfPrint(pdf, document, abort.signal)).rejects.toThrow();
  expect(document.querySelector('iframe')).toBeNull();
});

it('removes the print frame when its document is unavailable', async () => {
  const unavailable = vi
    .spyOn(HTMLIFrameElement.prototype, 'contentDocument', 'get')
    .mockReturnValue(null);
  try {
    await expect(
      preparePdfPrint(
        { numPages: 1 } as PDFDocumentProxy,
        document,
        new AbortController().signal,
      ),
    ).rejects.toThrow();
    expect(document.querySelector('iframe')).toBeNull();
  } finally {
    unavailable.mockRestore();
    document.querySelector('iframe')?.remove();
  }
});

it('releases print canvas backing stores when the print dialog closes', async () => {
  const pdf = {
    numPages: 1,
    getPage: vi.fn(async () => ({
      getViewport: ({ scale }: { scale: number }) => ({
        width: 100 * scale,
        height: 100 * scale,
      }),
      render: () => ({ promise: Promise.resolve() }),
    })),
  } as unknown as PDFDocumentProxy;
  const pending = preparePdfPrint(pdf, document, new AbortController().signal);
  const frame = document.querySelector('iframe')!;
  frame.contentWindow!.focus = vi.fn();
  frame.contentWindow!.print = vi.fn();
  await pending;
  const canvas = frame.contentDocument!.querySelector('canvas')!;
  expect(canvas.width).toBe(200);
  frame.contentWindow!.dispatchEvent(new Event('afterprint'));
  expect(canvas.width).toBe(0);
  expect(canvas.height).toBe(0);
  expect(frame.isConnected).toBe(false);
});
