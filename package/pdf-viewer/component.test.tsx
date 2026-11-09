import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PdfViewer } from './component';
import { PdfViewerToolbar } from './toolbar';
import { createPdfViewer } from './index';
import { pdfViewerIcons } from './icons';

const mock = vi.hoisted(() => ({ instances: [] as any[] }));
vi.mock('./controller', () => ({
  PdfViewerController: class {
    snapshot = {
      status: 'empty',
      fileName: 'document.pdf',
      page: 0,
      pageCount: 0,
      scale: 1,
      zoom: 'page-width',
      query: '',
      matchCount: 0,
    };
    canRetry = false;
    listeners = new Set<Function>();
    attach = vi.fn(async () => {});
    load = vi.fn(async () => {});
    destroy = vi.fn();
    setCallbacks = vi.fn();
    setPrintTitle = vi.fn();
    clearSearch = vi.fn();
    constructor() {
      mock.instances.push(this);
    }
    subscribe(listener: Function) {
      this.listeners.add(listener);
      listener(this.snapshot);
      return () => this.listeners.delete(listener);
    }
  },
}));
const host = document.createElement('div');
afterEach(() => {
  act(() => render(null, host));
  host.replaceChildren();
  mock.instances.length = 0;
});

describe('PDF viewer public compositions', () => {
  it('keeps the controller while replacing a source, then releases it on unmount', () => {
    act(() =>
      render(<PdfViewer workerSrc="/worker.mjs" source="/first.pdf" />, host),
    );
    const controller = mock.instances[0];
    expect(controller.load).toHaveBeenLastCalledWith('/first.pdf', undefined);
    act(() =>
      render(<PdfViewer workerSrc="/worker.mjs" source="/second.pdf" />, host),
    );
    expect(mock.instances).toHaveLength(1);
    expect(controller.load).toHaveBeenLastCalledWith('/second.pdf', undefined);
    act(() => render(null, host));
    expect(controller.destroy).toHaveBeenCalledOnce();
    expect(controller.listeners.size).toBe(0);
  });
  it('releases the old controller when worker configuration changes', () => {
    act(() => render(<PdfViewer workerSrc="/worker-one.mjs" />, host));
    const first = mock.instances[0];
    act(() => render(<PdfViewer workerSrc="/worker-two.mjs" />, host));
    expect(first.destroy).toHaveBeenCalledOnce();
    expect(mock.instances).toHaveLength(2);
    expect(mock.instances[1].attach).toHaveBeenCalledOnce();
  });
  it('supports translated labels, selected tools and custom status content', () => {
    act(() =>
      render(
        <PdfViewer
          workerSrc="/worker.mjs"
          toolbar={['open', 'navigation']}
          text={{ open: 'Ouvrir', page: 'Page du document' }}
          renderStatus={() => <p>Choose a document</p>}
        />,
        host,
      ),
    );
    expect(host.textContent).toContain('Ouvrir');
    expect(
      host.querySelector('[aria-label="Page du document"]'),
    ).not.toBeNull();
    expect(host.querySelector('[aria-label="Print PDF"]')).toBeNull();
    expect(host.textContent).toContain('Choose a document');
  });
  it('mounts in a native host and destroys it idempotently', () => {
    let controller!: ReturnType<typeof createPdfViewer>;
    act(() => {
      controller = createPdfViewer(host, {
        workerSrc: '/worker.mjs',
        toolbar: false,
      });
    });
    expect(host.querySelector('.rv-pdf-viewer')).not.toBeNull();
    expect(host.querySelector('[role="toolbar"]')).toBeNull();
    act(() => {
      controller.destroy();
      controller.destroy();
    });
    expect(host.children).toHaveLength(0);
  });
});

it('uses Font Awesome SVG assets for every viewer icon, including navigation and search input', () => {
  act(() => render(<PdfViewer workerSrc="/worker.mjs" />, host));
  const controller = mock.instances[0];
  act(() => {
    controller.snapshot = {
      ...controller.snapshot,
      status: 'ready',
      page: 1,
      pageCount: 3,
    };
    controller.listeners.forEach((listener: Function) =>
      listener(controller.snapshot),
    );
  });
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Find in document"]')!
      .click(),
  );
  const knownPaths = new Set(
    Object.values(pdfViewerIcons).flatMap((svg) =>
      Array.from(
        new DOMParser()
          .parseFromString(svg, 'image/svg+xml')
          .querySelectorAll('path'),
        (path) => path.getAttribute('d'),
      ),
    ),
  );
  expect(
    host.querySelector('.rv-pdf-viewer__document-icon svg'),
  ).not.toBeNull();
  expect(host.querySelector('.rv-search-input svg')).not.toBeNull();
  for (const svg of host.querySelectorAll('svg')) {
    const paths = [...svg.querySelectorAll('path')];
    expect(paths.length).toBeGreaterThan(0);
    paths.forEach((path) =>
      expect(knownPaths.has(path.getAttribute('d'))).toBe(true),
    );
  }
});

it('translates error copy and reordered summaries without displaying runtime diagnostics', () => {
  const text = {
    error: 'Erreur',
    errorDescription: 'Vérifiez le document.',
    operationError: 'Réessayez.',
    printDocument: 'Document à imprimer',
    pageCount: 'sur {pages}',
    pageSummary: '{pages} pages, page {page}',
    matchSummary: '{total} résultats, résultat {match}',
    search: 'Rechercher',
  };
  act(() => render(<PdfViewer workerSrc="/worker.mjs" text={text} />, host));
  const controller = mock.instances[0];
  const update = (change: object) =>
    act(() => {
      controller.snapshot = { ...controller.snapshot, ...change };
      controller.listeners.forEach((listener: Function) =>
        listener(controller.snapshot),
      );
    });
  expect(controller.setPrintTitle).toHaveBeenLastCalledWith(text.printDocument);
  update({ status: 'error', error: new Error('English runtime diagnostic') });
  expect(host.textContent).toContain('Vérifiez le document.');
  expect(host.textContent).not.toContain('English runtime diagnostic');
  update({
    status: 'ready',
    page: 2,
    pageCount: 3,
    query: 'test',
    match: 1,
    matchCount: 4,
  });
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Rechercher"]')!.click(),
  );
  expect(host.querySelector('.rv-pdf-viewer__summary')?.textContent).toBe(
    '3 pages, page 2',
  );
  expect(host.querySelector('.rv-pdf-viewer__page-count')?.textContent).toBe(
    'sur 3',
  );
  expect(host.querySelector('.rv-pdf-viewer__matches')?.textContent).toBe(
    '4 résultats, résultat 1',
  );
  expect(host.textContent).toContain('Réessayez.');
  expect(host.textContent).not.toContain('English runtime diagnostic');
});

it('supports custom toolbar composition with working open/search context and hides the header', () => {
  const custom = vi.fn((_controller, _state, props) => (
    <PdfViewerToolbar {...props} />
  ));
  act(() =>
    render(
      <PdfViewer
        workerSrc="/worker.mjs"
        showHeader={false}
        toolbar={{ tools: ['search', 'rotate'], buttons: { rotate: false } }}
        renderToolbar={custom}
      />,
      host,
    ),
  );
  expect(host.querySelector('.rv-pdf-viewer__header')).toBeNull();
  expect(host.querySelector('[aria-label="Rotate clockwise"]')).toBeNull();
  const controller = mock.instances[0];
  act(() => {
    controller.snapshot = {
      ...controller.snapshot,
      status: 'ready',
      page: 1,
      pageCount: 3,
    };
    controller.listeners.forEach((listener: Function) =>
      listener(controller.snapshot),
    );
  });
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Find in document"]')!
      .click(),
  );
  expect(host.querySelector('[role="search"]')).not.toBeNull();
  expect(mock.instances).toHaveLength(1);
  expect(custom.mock.lastCall?.[2].onOpen).toBeTypeOf('function');
  act(() =>
    render(
      <PdfViewer
        workerSrc="/worker.mjs"
        toolbar={{ buttons: { search: { disabled: true } } }}
      />,
      host,
    ),
  );
  expect(host.querySelector('[role="search"]')).toBeNull();
  expect(
    host.querySelector<HTMLButtonElement>('[aria-label="Find in document"]')
      ?.disabled,
  ).toBe(true);
});
