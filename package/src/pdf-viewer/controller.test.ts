import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PdfViewerController } from './controller';

const mock = vi.hoisted(() => ({
  tasks: [] as any[],
  viewers: [] as any[],
  buses: [] as any[],
  ports: [] as any[],
  getDocument: vi.fn(),
  load: vi.fn(),
  terminate: vi.fn(),
  workerDestroy: vi.fn(),
  print: vi.fn(),
}));
vi.mock('./print', () => ({
  preparePdfPrint: (...args: unknown[]) => mock.print(...args),
}));
vi.mock('./runtime', () => ({ loadPdfRuntime: () => mock.load() }));
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
class Bus {
  listeners = new Map<string, Function[]>();
  constructor() {
    mock.buses.push(this);
  }
  on(name: string, listener: Function) {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), listener]);
  }
  dispatch(name: string, event: object) {
    this.listeners.get(name)?.forEach((listener) => listener(event));
  }
}
class Viewer {
  pdfDocument: any;
  firstPagePromise: Promise<unknown> = Promise.resolve();
  pagesPromise: Promise<unknown> = new Promise(() => {});
  currentPage = 1;
  currentScale = 1;
  pagesRotation = 0;
  pageViews: object[] = [];
  getPageView(index: number) {
    return this.pageViews[index];
  }
  constructor(public options: any) {
    mock.viewers.push(this);
  }
  setDocument(pdf: any) {
    this.pdfDocument = pdf;
    this.pageViews = Array.from({ length: pdf?.numPages ?? 0 }, () => ({}));
    if (pdf)
      queueMicrotask(() => this.options.eventBus.dispatch('pagesinit', {}));
  }
  set currentPageNumber(value: number) {
    this.currentPage = value;
    this.options.eventBus.dispatch('pagechanging', { pageNumber: value });
  }
  get currentPageNumber() {
    return this.currentPage;
  }
  set currentScaleValue(value: string) {
    this.currentScale = Number(value) || 1;
    this.options.eventBus.dispatch('scalechanging', {
      scale: this.currentScale,
      presetValue: value,
    });
  }
}
const runtime = {
  EventBus: Bus,
  PDFViewer: Viewer,
  PDFLinkService: class {
    setViewer() {}
    setDocument() {}
  },
  PDFFindController: class {},
  PDFWorker: { create: () => ({ destroy: mock.workerDestroy }) },
  getDocument: mock.getDocument,
  AnnotationMode: { ENABLE: 1 },
  FindState: { PENDING: 3 },
};
const controllers: PdfViewerController[] = [];
async function mount() {
  const error = vi.fn(),
    load = vi.fn(),
    page = vi.fn();
  const controller = new PdfViewerController({
    workerSrc: '/worker.mjs',
    onError: error,
    onLoad: load,
    onPageChange: page,
  });
  controllers.push(controller);
  const container = document.createElement('div');
  await controller.attach(container);
  return { controller, error, load, page, container };
}
function documentWithPages(numPages = 3) {
  return { numPages, getData: vi.fn(async () => new Uint8Array([1, 2, 3])) };
}
beforeEach(() => {
  mock.tasks.length = 0;
  mock.viewers.length = 0;
  mock.buses.length = 0;
  mock.ports.length = 0;
  vi.clearAllMocks();
  mock.load.mockResolvedValue(runtime);
  mock.getDocument.mockImplementation(() => {
    const task = { ...deferred<any>(), destroy: vi.fn(async () => {}) };
    mock.tasks.push(task);
    return task;
  });
  vi.stubGlobal(
    'Worker',
    class extends EventTarget {
      terminate = mock.terminate;
      constructor() {
        super();
        mock.ports.push(this);
      }
    },
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  controllers.splice(0).forEach((controller) => controller.destroy());
  vi.unstubAllGlobals();
});

describe('PDF viewer lifecycle', () => {
  it('publishes loaded state and delegates bounded page/zoom, rotation and search commands', async () => {
    const { controller, load, page } = await mount();
    const pending = controller.load(new Uint8Array([1]), 'report.pdf');
    await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
    mock.tasks[0].resolve(documentWithPages());
    await pending;
    expect(controller.snapshot).toMatchObject({
      status: 'ready',
      fileName: 'report.pdf',
      page: 1,
      pageCount: 3,
    });
    expect(load).toHaveBeenCalledWith({ fileName: 'report.pdf', pageCount: 3 });
    controller.goToPage(999);
    expect(page).toHaveBeenLastCalledWith(3);
    controller.setZoom(100);
    expect(controller.snapshot.scale).toBe(5);
    controller.rotate();
    expect(controller.snapshot.rotation).toBe(90);
    controller.rotate();
    controller.rotate();
    controller.rotate();
    expect(controller.snapshot.rotation).toBe(0);
    const listener = vi.fn();
    mock.buses[0].on('find', listener);
    controller.search('report', true, true);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'report',
        type: 'again',
        findPrevious: true,
      }),
    );
    mock.buses[0].dispatch('updatefindmatchescount', {
      matchesCount: { current: 2, total: 4 },
    });
    expect(controller.snapshot).toMatchObject({ match: 2, matchCount: 4 });
    controller.clearSearch();
    expect(controller.snapshot.query).toBe('');
  });
  it('cancels an obsolete load and never publishes its late result', async () => {
    const { controller, load } = await mount();
    const first = controller.load('/first.pdf');
    await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
    const second = controller.load('/second.pdf');
    await vi.waitFor(() => expect(mock.tasks).toHaveLength(2));
    expect(mock.tasks[0].destroy).toHaveBeenCalledOnce();
    mock.tasks[1].resolve(documentWithPages(2));
    await second;
    mock.tasks[0].resolve(documentWithPages(99));
    await first;
    expect(controller.snapshot).toMatchObject({
      fileName: 'second.pdf',
      pageCount: 2,
    });
    expect(load).toHaveBeenCalledTimes(1);
  });
  it('reports a failed load and recovers on the next source', async () => {
    const { controller, error } = await mount();
    const first = controller.load('/broken.pdf');
    await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
    mock.tasks[0].reject(new Error('Invalid PDF'));
    await first;
    expect(controller.snapshot).toMatchObject({
      status: 'error',
      pageCount: 0,
    });
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid PDF' }),
    );
    const next = controller.load('/good.pdf');
    await vi.waitFor(() => expect(mock.tasks).toHaveLength(2));
    mock.tasks[1].resolve(documentWithPages());
    await next;
    expect(controller.snapshot.error).toBeNull();
    expect(controller.snapshot.status).toBe('ready');
  });
  it('destroys loading tasks, explicit workers and DOM content exactly once', async () => {
    const { controller, container, load } = await mount();
    const pending = controller.load('/slow.pdf');
    await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
    controller.destroy();
    controller.destroy();
    mock.tasks[0].resolve(documentWithPages());
    await pending;
    expect(mock.tasks[0].destroy).toHaveBeenCalledOnce();
    expect(mock.workerDestroy).toHaveBeenCalledOnce();
    expect(mock.terminate).toHaveBeenCalledOnce();
    expect(container.children).toHaveLength(0);
    expect(load).not.toHaveBeenCalled();
  });
  it('does not initialize a viewer after unmount while the runtime is loading', async () => {
    const delayed = deferred<any>();
    mock.load.mockReturnValueOnce(delayed.promise);
    const controller = new PdfViewerController({ workerSrc: '/worker.mjs' });
    controllers.push(controller);
    const initialized = controller.attach(document.createElement('div'));
    controller.destroy();
    delayed.resolve(runtime);
    await initialized;
    expect(mock.viewers).toHaveLength(0);
  });
  it('clears pending loads and search state when the source is removed', async () => {
    const { controller } = await mount();
    const pending = controller.load('/slow.pdf');
    await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
    await controller.load(null);
    mock.tasks[0].reject(new Error('Cancelled'));
    await pending;
    expect(controller.snapshot).toMatchObject({
      status: 'empty',
      pageCount: 0,
      query: '',
      error: null,
    });
  });
  it('keeps initialization failures observable', async () => {
    mock.load.mockRejectedValueOnce(new Error('Missing PDF runtime'));
    const controller = new PdfViewerController({ workerSrc: '/worker.mjs' });
    controllers.push(controller);
    const attached = controller.attach(document.createElement('div'));
    const loading = controller.load('/document.pdf');
    await expect(attached).rejects.toThrow('Missing PDF runtime');
    await loading;
    expect(controller.snapshot).toMatchObject({
      status: 'error',
      error: expect.any(Error),
    });
  });
});

it('ignores late find results after search is closed', async () => {
  const { controller } = await mount();
  const loading = controller.load('/document.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  mock.tasks[0].resolve(documentWithPages());
  await loading;
  controller.search('report');
  controller.clearSearch();
  mock.buses[0].dispatch('updatefindmatchescount', {
    matchesCount: { current: 1, total: 8 },
  });
  mock.buses[0].dispatch('updatefindcontrolstate', {
    state: 3,
    matchesCount: { current: 1, total: 8 },
  });
  expect(controller.snapshot).toMatchObject({
    query: '',
    match: 0,
    matchCount: 0,
    searching: false,
  });
});

it('keeps the worker alive until PDF.js finishes document teardown', async () => {
  const { controller } = await mount();
  const loading = controller.load('/document.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  mock.tasks[0].resolve(documentWithPages());
  await loading;
  const teardown = deferred<void>();
  mock.tasks[0].destroy.mockReturnValue(teardown.promise);
  controller.destroy();
  expect(mock.terminate).not.toHaveBeenCalled();
  teardown.resolve();
  await vi.waitFor(() => expect(mock.terminate).toHaveBeenCalledOnce());
});

it('cancels print preparation without letting its late completion change a new print', async () => {
  const { controller } = await mount();
  const loading = controller.load('/document.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  mock.tasks[0].resolve(documentWithPages());
  await loading;
  const first = deferred<() => void>(),
    second = deferred<() => void>();
  mock.print
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const firstPrint = controller.print();
  expect(controller.snapshot.printing).toBe(true);
  const signal = mock.print.mock.calls[0][2] as AbortSignal;
  controller.cancelPrint();
  expect(signal.aborted).toBe(true);
  expect(controller.snapshot.printing).toBe(false);
  const secondPrint = controller.print();
  const firstCleanup = vi.fn();
  first.resolve(firstCleanup);
  await firstPrint;
  expect(firstCleanup).toHaveBeenCalledOnce();
  expect(controller.snapshot.printing).toBe(true);
  second.resolve(vi.fn());
  await secondPrint;
  expect(controller.snapshot.printing).toBe(false);
});

it('reports worker startup failures and settles loading even when PDF.js teardown cannot complete', async () => {
  const { controller, error } = await mount();
  const loading = controller.load('/document.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  mock.tasks[0].destroy.mockReturnValue(new Promise(() => {}));
  mock.ports[0].dispatchEvent(new Event('error', { cancelable: true }));
  await vi.waitFor(() => expect(controller.snapshot.status).toBe('error'));
  await loading;
  expect(error).toHaveBeenCalledOnce();
  expect(mock.terminate).toHaveBeenCalledOnce();
});

it('reports a worker crash after the document has loaded', async () => {
  const { controller, error } = await mount();
  const loading = controller.load('/document.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  mock.tasks[0].resolve(documentWithPages());
  await loading;
  mock.ports[0].dispatchEvent(new Event('messageerror'));
  expect(controller.snapshot).toMatchObject({ status: 'error', pageCount: 0 });
  expect(error).toHaveBeenCalledOnce();
});

it('settles a replaced load without waiting for an unresponsive PDF.js task', async () => {
  const { controller } = await mount();
  let settled = false;
  const loading = controller.load('/document.pdf').then(() => {
    settled = true;
  });
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  await controller.load(null);
  await vi.waitFor(() => expect(settled).toBe(true));
  await loading;
  expect(controller.snapshot.status).toBe('empty');
});

it('exposes first-page viewer initialization failures instead of staying in loading', async () => {
  const { controller, error } = await mount();
  const firstPage = deferred<void>(),
    pages = deferred<void>();
  mock.viewers[0].firstPagePromise = firstPage.promise;
  mock.viewers[0].pagesPromise = pages.promise;
  mock.viewers[0].setDocument = function (pdf: unknown) {
    this.pdfDocument = pdf;
  };
  // Suppress an unhandled mock rejection while checking the old controller's missing handler.
  void pages.promise.catch(() => {});
  const loading = controller.load('/document.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  mock.tasks[0].resolve(documentWithPages());
  await Promise.resolve();
  pages.reject(new Error('First page unavailable'));
  try {
    await vi.waitFor(() => expect(controller.snapshot.status).toBe('error'));
    expect(error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'First page unavailable' }),
    );
  } finally {
    firstPage.resolve();
    await loading;
  }
});

it('ignores queued rendering and navigation events after the document is cleared or destroyed', async () => {
  const { controller, error, page } = await mount();
  const loading = controller.load('/document.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  mock.tasks[0].resolve(documentWithPages());
  await loading;
  const bus = mock.buses[0];
  page.mockClear();
  await controller.load(null);
  bus.dispatch('pagerendered', { error: new Error('Old render failed') });
  bus.dispatch('pagechanging', { pageNumber: 3 });
  bus.dispatch('scalechanging', { scale: 2 });
  expect(controller.snapshot).toMatchObject({
    status: 'empty',
    page: 0,
    error: null,
  });
  expect(error).not.toHaveBeenCalled();
  expect(page).not.toHaveBeenCalled();
  controller.destroy();
  bus.dispatch('pagerendered', { error: new Error('Detached render failed') });
  expect(error).not.toHaveBeenCalled();
});

it('ignores render errors from pages belonging to the replaced document', async () => {
  const { controller, error } = await mount();
  const first = controller.load('/first.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
  mock.tasks[0].resolve(documentWithPages());
  await first;
  const oldPage = mock.viewers[0].getPageView(0);
  const next = controller.load('/next.pdf');
  await vi.waitFor(() => expect(mock.tasks).toHaveLength(2));
  mock.tasks[1].resolve(documentWithPages());
  await next;
  mock.buses[0].dispatch('pagerendered', {
    source: oldPage,
    pageNumber: 1,
    error: new Error('Old page failed'),
  });
  expect(controller.snapshot.error).toBeNull();
  expect(error).not.toHaveBeenCalled();
  mock.buses[0].dispatch('pagerendered', {
    source: mock.viewers[0].getPageView(0),
    pageNumber: 1,
    error: new Error('Current page failed'),
  });
  expect(error).toHaveBeenCalledOnce();
});

it('forwards the application PDF.js localization service', async () => {
  const l10n = { getLanguage: () => 'fr' } as NonNullable<
    import('./types').PdfViewerOptions['l10n']
  >;
  const controller = new PdfViewerController({
    workerSrc: '/worker.mjs',
    l10n,
  });
  controllers.push(controller);
  await controller.attach(document.createElement('div'));
  expect(mock.viewers[0].options.l10n).toBe(l10n);
});

it('retries runtime initialization after a transient import failure', async () => {
  mock.load.mockRejectedValueOnce(new Error('Runtime chunk unavailable'));
  const controller = new PdfViewerController({ workerSrc: '/worker.mjs' });
  controllers.push(controller);
  const container = document.createElement('div');
  await expect(controller.attach(container)).rejects.toThrow(
    'Runtime chunk unavailable',
  );
  await controller.load('/report.pdf');
  expect(controller.snapshot.status).toBe('error');
  const retry = controller.retry();
  try {
    await vi.waitFor(() => expect(mock.tasks).toHaveLength(1));
    mock.tasks[0].resolve(documentWithPages());
    await retry;
    expect(controller.snapshot.status).toBe('ready');
    expect(container.querySelectorAll('.pdfViewer')).toHaveLength(1);
  } finally {
    controller.destroy();
    await retry;
  }
});
