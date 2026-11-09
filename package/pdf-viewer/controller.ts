import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  PDFWorker,
} from 'pdfjs-dist';
import type {
  PDFViewer,
  EventBus,
  PDFLinkService,
} from 'pdfjs-dist/web/pdf_viewer.mjs';
import { loadPdfRuntime, type PdfRuntime } from './runtime';
import {
  normalizePdfPage,
  normalizePdfZoom,
  pdfFileName,
  pdfSourceParameters,
} from './model';
import { preparePdfPrint } from './print';
import { releasePreactElement } from '../preact-mount';
import { createPdfPages, createPdfDownload } from './surfaces.view';
import type {
  PdfSource,
  PdfViewerOptions,
  PdfViewerState,
  PdfZoom,
} from './types';

/** Framework-neutral document lifecycle and commands. Attach to an absolutely positioned div. */
export class PdfViewerController {
  private state: PdfViewerState;
  private listeners = new Set<(state: Readonly<PdfViewerState>) => void>();
  private container?: HTMLDivElement;
  private content?: HTMLDivElement;
  private runtime?: PdfRuntime;
  private viewer?: PDFViewer;
  private bus?: EventBus;
  private links?: PDFLinkService;
  private initializing?: Promise<void>;
  private initializationFailed = false;
  private lifetime = new AbortController();
  private generation = 0;
  private loadAbort?: AbortController;
  private disposed = false;
  private task?: PDFDocumentLoadingTask;
  private document?: PDFDocumentProxy;
  private worker?: PDFWorker;
  private port?: Worker;
  private printAbort?: AbortController;
  private printCleanup?: () => void;
  private pendingPage = 1;
  private lastSource: PdfSource | null = null;
  private lastFileName?: string;
  private downloadUrls = new Set<string>();
  private options: PdfViewerOptions;
  private printTitle = 'PDF print document';
  /** Update translated print-frame accessibility text without reloading the PDF. */
  setPrintTitle(title: string) {
    this.printTitle = title;
  }

  constructor(options: PdfViewerOptions) {
    this.options = options;
    this.state = {
      status: 'empty',
      fileName: pdfFileName(options.source, options.fileName),
      page: 0,
      pageCount: 0,
      zoom: normalizePdfZoom(options.initialZoom ?? 'page-width'),
      scale: 1,
      rotation: 0,
      query: '',
      match: 0,
      matchCount: 0,
      searching: false,
      printing: false,
      error: null,
    };
  }
  get snapshot(): Readonly<PdfViewerState> {
    return this.state;
  }
  get canRetry() {
    return this.lastSource !== null;
  }
  retry() {
    if (this.initializationFailed && this.container && !this.disposed) {
      this.lifetime.abort();
      this.lifetime = new AbortController();
      if (this.content) releasePreactElement(this.content);
      this.content = undefined;
      this.viewer = undefined;
      this.links = undefined;
      this.bus = undefined;
      this.startInitialization(this.container);
    }
    return this.load(this.lastSource, this.lastFileName);
  }
  /** Update event handlers without recreating the document or its worker. */
  setCallbacks(
    callbacks: Pick<
      PdfViewerOptions,
      'onLoad' | 'onError' | 'onPageChange' | 'onZoomChange'
    >,
  ) {
    const { onLoad, onError, onPageChange, onZoomChange } = callbacks;
    this.options = {
      ...this.options,
      onLoad,
      onError,
      onPageChange,
      onZoomChange,
    };
  }
  subscribe(listener: (state: Readonly<PdfViewerState>) => void) {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private update(change: Partial<PdfViewerState>) {
    if (this.disposed) return;
    this.state = Object.freeze({ ...this.state, ...change });
    this.listeners.forEach((listener) => listener(this.state));
  }
  private report(error: unknown) {
    if (this.disposed) return;
    const value = error instanceof Error ? error : new Error(String(error));
    this.update({ error: value });
    this.options.onError?.(value);
  }
  attach(container: HTMLDivElement): Promise<void> {
    if (this.disposed)
      return Promise.reject(new Error('PDF viewer is destroyed'));
    if (this.container) throw new Error('PDF viewer is already attached');
    this.container = container;
    this.startInitialization(container);
    return this.initializing!;
  }
  private startInitialization(container: HTMLDivElement) {
    this.initializationFailed = false;
    this.initializing = this.initialize(container);
    // load() exposes initialization errors as state; prevent an unhandled rejection when empty.
    void this.initializing.catch((error) => {
      this.initializationFailed = true;
      if (!this.disposed && this.state.status !== 'loading') {
        this.update({ status: 'error' });
        this.report(error);
      }
    });
  }
  private async initialize(container: HTMLDivElement) {
    const runtime = await loadPdfRuntime();
    if (this.disposed) return;
    this.runtime = runtime;
    const bus = (this.bus = new runtime.EventBus());
    this.links = new runtime.PDFLinkService({
      eventBus: bus,
      externalLinkTarget: 2,
      externalLinkRel: 'noopener noreferrer nofollow',
    });
    const find = new runtime.PDFFindController({
      eventBus: bus,
      linkService: this.links,
    });
    const content = (this.content = createPdfPages(container.ownerDocument));
    container.append(content);
    // PDF.js 6.4 supports abortSignal, although the generated type omits it.
    const options = {
      container,
      viewer: content,
      eventBus: bus,
      linkService: this.links,
      findController: find,
      l10n: this.options.l10n,
      annotationMode: runtime.AnnotationMode.ENABLE,
      abortSignal: this.lifetime.signal,
    };
    this.viewer = new runtime.PDFViewer(options);
    this.links.setViewer(this.viewer);
    bus.on('pagesinit', () => {
      if (!this.document || this.viewer?.pdfDocument !== this.document) return;
      this.viewer.currentScaleValue = String(this.state.zoom);
      this.viewer.currentPageNumber = normalizePdfPage(
        this.pendingPage,
        this.document.numPages,
      );
      this.update({
        status: 'ready',
        pageCount: this.document.numPages,
        page: this.viewer.currentPageNumber,
        scale: this.viewer.currentScale,
      });
      this.options.onLoad?.({
        pageCount: this.document.numPages,
        fileName: this.state.fileName,
      });
    });
    bus.on('pagechanging', ({ pageNumber }: { pageNumber: number }) => {
      if (this.disposed || !this.document) return;
      this.update({ page: pageNumber });
      this.options.onPageChange?.(pageNumber);
    });
    bus.on(
      'scalechanging',
      ({ scale, presetValue }: { scale: number; presetValue?: string }) => {
        if (this.disposed || !this.document) return;
        const zoom =
          presetValue === 'page-width' || presetValue === 'page-fit'
            ? presetValue
            : scale;
        this.update({ zoom, scale });
        this.options.onZoomChange?.(zoom, scale);
      },
    );
    bus.on(
      'updatefindmatchescount',
      ({
        matchesCount,
      }: {
        matchesCount: { current: number; total: number };
      }) => {
        if (this.state.status !== 'ready' || !this.state.query) return;
        this.update({
          match: matchesCount.current,
          matchCount: matchesCount.total,
        });
      },
    );
    bus.on(
      'updatefindcontrolstate',
      ({
        state,
        matchesCount,
        rawQuery,
      }: {
        state: number;
        matchesCount: { current: number; total: number };
        rawQuery?: string;
      }) => {
        if (
          this.state.status !== 'ready' ||
          !this.state.query ||
          (rawQuery !== undefined && rawQuery !== this.state.query)
        )
          return;
        this.update({
          searching: state === runtime.FindState.PENDING,
          match: matchesCount.current,
          matchCount: matchesCount.total,
        });
      },
    );
    bus.on(
      'pagerendered',
      ({
        error,
        source,
        pageNumber,
      }: {
        error?: unknown;
        source?: unknown;
        pageNumber?: number;
      }) => {
        if (!error || this.disposed || !this.document) return;
        if (
          source &&
          (pageNumber === undefined ||
            this.viewer?.getPageView(pageNumber - 1) !== source)
        )
          return;
        this.report(error);
      },
    );
    const observer = new ResizeObserver(() => {
      if (
        this.state.status === 'ready' &&
        typeof this.state.zoom === 'string'
      ) {
        this.viewer!.currentScaleValue = this.state.zoom;
      }
    });
    observer.observe(container);
    this.lifetime.signal.addEventListener(
      'abort',
      () => observer.disconnect(),
      { once: true },
    );
  }
  /** The latest source wins. Empty/null clears the document. Failures are exposed in snapshot/onError. */
  async load(source: PdfSource | null, fileName?: string): Promise<void> {
    if (this.disposed) return;
    this.lastSource = source;
    this.lastFileName = fileName;
    const generation = ++this.generation;
    this.releaseDocument();
    if (this.disposed || generation !== this.generation) return;
    const operation = new AbortController();
    if (source !== null) this.loadAbort = operation;
    this.pendingPage = normalizePdfPage(
      this.options.initialPage ?? 1,
      Number.MAX_SAFE_INTEGER,
    );
    this.update({
      status: source === null ? 'empty' : 'loading',
      fileName: pdfFileName(source, fileName),
      page: 0,
      pageCount: 0,
      error: null,
      rotation: 0,
      query: '',
      match: 0,
      matchCount: 0,
      searching: false,
      printing: false,
    });
    if (source === null || this.disposed || generation !== this.generation)
      return;
    // Every asynchronous loading stage can settle promptly when the source changes.
    const canceled = new Promise<never>((_, reject) => {
      operation.signal.addEventListener(
        'abort',
        () => reject(new DOMException('PDF loading canceled', 'AbortError')),
        { once: true },
      );
    });
    const wait = <T>(promise: Promise<T>): Promise<T> =>
      Promise.race([promise, canceled]);
    try {
      if (!this.initializing)
        throw new Error('Attach the PDF viewer before loading a document');
      const parameters = await wait(pdfSourceParameters(source));
      await wait(this.initializing);
      if (this.disposed || generation !== this.generation) return;
      if (!this.options.workerSrc)
        throw new Error('PDF viewer requires a matching PDF.js workerSrc');
      this.port = new Worker(this.options.workerSrc, { type: 'module' });
      const workerFailed = (event: Event) => {
        event.preventDefault();
        this.failLoad(
          generation,
          new Error(
            'PDF worker failed to load or stopped unexpectedly. Check the worker URL and browser permissions.',
          ),
          true,
        );
      };
      this.port.addEventListener('error', workerFailed, {
        signal: operation.signal,
      });
      this.port.addEventListener('messageerror', workerFailed, {
        signal: operation.signal,
      });
      this.worker = this.runtime!.PDFWorker.create({ port: this.port });
      const task = (this.task = this.runtime!.getDocument({
        ...this.options.documentOptions,
        ...parameters,
        worker: this.worker,
      }));
      const document = await wait(task.promise);
      if (this.disposed || generation !== this.generation) return;
      this.document = document;
      this.links!.setDocument(document);
      this.viewer!.setDocument(document);
      // PDF.js rejects pagesPromise on initialization errors even when its first-page
      // capability stays pending (or was resolved just before initialization failed).
      const initialized = this.viewer!.pagesPromise.catch((error: unknown) =>
        this.failLoad(generation, error),
      );
      await wait(Promise.race([this.viewer!.firstPagePromise, initialized]));
    } catch (error) {
      this.failLoad(generation, error);
    }
  }
  private failLoad(generation: number, error: unknown, forceWorker = false) {
    if (
      this.disposed ||
      generation !== this.generation ||
      this.state.status === 'error'
    )
      return;
    this.releaseDocument(forceWorker);
    if (this.disposed || generation !== this.generation) return;
    this.update({
      status: 'error',
      pageCount: 0,
      page: 0,
      query: '',
      match: 0,
      matchCount: 0,
      searching: false,
    });
    this.report(error);
  }
  goToPage(page: number) {
    if (this.state.status !== 'ready') return;
    this.viewer!.currentPageNumber = normalizePdfPage(
      page,
      this.state.pageCount,
    );
  }
  setZoom(zoom: PdfZoom) {
    if (this.state.status !== 'ready') return;
    this.viewer!.currentScaleValue = String(normalizePdfZoom(zoom));
  }
  rotate() {
    if (this.state.status !== 'ready') return;
    const rotation = (this.state.rotation + 90) % 360;
    this.viewer!.pagesRotation = rotation;
    this.update({ rotation });
  }
  search(query: string, previous = false, again = false) {
    if (this.state.status !== 'ready') return;
    this.update({
      query,
      searching: !!query,
      ...(again ? {} : { match: 0, matchCount: 0 }),
    });
    this.bus!.dispatch('find', {
      source: this,
      type: again ? 'again' : '',
      query,
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,
      findPrevious: previous,
      matchDiacritics: false,
    });
  }
  clearSearch() {
    this.bus?.dispatch('findbarclose', { source: this });
    this.update({ query: '', match: 0, matchCount: 0, searching: false });
  }
  async download() {
    const document = this.document;
    if (!document || !this.container) return;
    try {
      const data = await document.getData();
      if (this.disposed || document !== this.document) return;
      const url = URL.createObjectURL(
        new Blob([new Uint8Array(data)], { type: 'application/pdf' }),
      );
      this.downloadUrls.add(url);
      const link = createPdfDownload(
        this.container.ownerDocument,
        url,
        this.state.fileName,
      );
      try {
        link.click();
      } finally {
        releasePreactElement(link);
      }
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.downloadUrls.delete(url);
      }, 1000);
    } catch (error) {
      if (!this.disposed && document === this.document) this.report(error);
    }
  }
  async print() {
    const document = this.document;
    if (!document || !this.container || this.state.printing) return;
    this.printCleanup?.();
    this.printAbort?.abort();
    const abort = (this.printAbort = new AbortController());
    this.update({ printing: true });
    try {
      const cleanup = await preparePdfPrint(
        document,
        this.container.ownerDocument,
        abort.signal,
        this.printTitle,
      );
      if (abort.signal.aborted || abort !== this.printAbort) cleanup();
      else this.printCleanup = cleanup;
    } catch (error) {
      if (!abort.signal.aborted) this.report(error);
    } finally {
      if (abort === this.printAbort) this.update({ printing: false });
    }
  }
  cancelPrint() {
    this.printAbort?.abort();
    this.printAbort = undefined;
    this.printCleanup?.();
    this.printCleanup = undefined;
    if (this.state.printing) this.update({ printing: false });
  }
  private releaseDocument(forceWorker = false) {
    const task = this.task,
      worker = this.worker,
      port = this.port,
      operation = this.loadAbort;
    this.task = undefined;
    this.worker = undefined;
    this.port = undefined;
    this.loadAbort = undefined;
    this.document = undefined;
    operation?.abort();
    this.viewer?.setDocument(null);
    this.links?.setDocument(null);
    const releaseWorker = () => {
      worker?.destroy();
      port?.terminate();
    };
    // A failed worker cannot acknowledge Terminate. Healthy workers finish the
    // PDF.js teardown RPC before their externally owned native port is terminated.
    if (task) {
      const destroyed = task.destroy().catch(() => {});
      if (forceWorker) releaseWorker();
      else void destroyed.finally(releaseWorker);
    } else releaseWorker();
    this.cancelPrint();
  }
  destroy() {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    this.releaseDocument();
    this.lastSource = null;
    this.lifetime.abort();
    this.downloadUrls.forEach((url) => URL.revokeObjectURL(url));
    this.downloadUrls.clear();
    this.listeners.clear();
    if (this.content) releasePreactElement(this.content);
    this.content = undefined;
    this.container?.replaceChildren();
    this.bus = undefined;
    this.viewer = undefined;
    this.links = undefined;
    this.container = undefined;
  }
}
