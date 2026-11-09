import { dropdownOptions } from '../../../tests/helpers/dropdown.mjs';
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { PdfViewerToolbar, type PdfViewerToolbarProps } from './toolbar';
import type { PdfViewerController } from './controller';
import type { PdfViewerState } from './types';

const host = document.createElement('div');
const state: PdfViewerState = {
  status: 'ready',
  fileName: 'report.pdf',
  page: 2,
  pageCount: 3,
  zoom: 1.3,
  scale: 1.3,
  rotation: 0,
  query: '',
  match: 0,
  matchCount: 0,
  searching: false,
  printing: false,
  error: null,
};
const commands = {
  goToPage: vi.fn(),
  setZoom: vi.fn(),
  rotate: vi.fn(),
  print: vi.fn(),
  download: vi.fn(),
  snapshot: state,
};
function mount(props: Partial<PdfViewerToolbarProps> = {}) {
  act(() =>
    render(
      <PdfViewerToolbar
        controller={commands as unknown as PdfViewerController}
        state={state}
        onOpen={vi.fn()}
        onToggleSearch={vi.fn()}
        {...props}
      />,
      host,
    ),
  );
}
afterEach(() => {
  act(() => render(null, host));
  vi.clearAllMocks();
});

it('configures individual controls without overriding document availability constraints', () => {
  mount({
    config: {
      tools: ['navigation', 'zoom', 'print'],
      showPageInput: false,
      showPageCount: false,
      showZoomSelect: false,
      buttons: {
        previous: false,
        zoomOut: false,
        next: { disabled: true },
        print: { className: 'custom-print', variant: 'primary' },
      },
    },
  });
  expect(host.querySelector('input,select')).toBeNull();
  expect(host.querySelector('[aria-label="Previous page"]')).toBeNull();
  expect(
    host.querySelector<HTMLButtonElement>('[aria-label="Next page"]')?.disabled,
  ).toBe(true);
  expect(
    host
      .querySelector('[aria-label="Print PDF"]')
      ?.classList.contains('custom-print'),
  ).toBe(true);
  expect(
    host
      .querySelector('[aria-label="Print PDF"]')
      ?.classList.contains('rv-btn-primary'),
  ).toBe(true);
  mount({
    state: { ...state, status: 'loading' },
    config: { buttons: { print: { disabled: false } } },
  });
  expect(
    host.querySelector<HTMLButtonElement>('[aria-label="Print PDF"]')?.disabled,
  ).toBe(true);
});

it('normalizes zoom choices and keeps the current scale with translated option labels', async () => {
  mount({
    config: {
      tools: ['zoom'],
      zoomLevels: [0.5, 0.5, NaN, 20, 'page-fit'],
      zoomStep: 2,
    },
    text: { fitPage: 'Page entière', zoomPercentage: '{percent} pour cent' },
  });
  const select = host.querySelector<HTMLElement>('[role=combobox]')!;
  expect(select.textContent).toContain('130 pour cent');
  const choices = await dropdownOptions(select);
  expect(choices.map((option) => option.textContent?.trim())).toEqual([
    '50 pour cent',
    'Page entière',
    '130 pour cent',
  ]);
  await act(async () => choices[2].click());
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Zoom in"]')!.click(),
  );
  expect(commands.setZoom).toHaveBeenCalledWith(2.6);
  mount({ config: { tools: ['zoom'], zoomStep: Infinity } });
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Zoom out"]')!.click(),
  );
  expect(commands.setZoom).toHaveBeenLastCalledWith(1.3 / 1.25);
});

it('hides an empty toolbar and empty navigation/zoom groups', () => {
  mount({
    config: {
      tools: ['navigation', 'zoom'],
      showPageInput: false,
      showPageCount: false,
      showZoomSelect: false,
      buttons: { previous: false, next: false, zoomIn: false, zoomOut: false },
    },
  });
  expect(host.querySelector('[role="toolbar"]')).toBeNull();
  mount({ config: false });
  expect(host.children).toHaveLength(0);
  mount({ config: [] });
  expect(host.children).toHaveLength(0);
});

it('delegates open and search without owning a second document lifecycle', () => {
  const onOpen = vi.fn(),
    onToggleSearch = vi.fn();
  mount({
    config: ['open', 'search'],
    onOpen,
    onToggleSearch,
    searchId: 'find-panel',
    searchOpen: true,
    text: { open: 'Ouvrir', search: 'Rechercher', toolbar: 'Outils PDF' },
  });
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Ouvrir"]')!.click(),
  );
  const search = host.querySelector<HTMLButtonElement>(
    '[aria-label="Rechercher"]',
  )!;
  act(() => search.click());
  expect(onOpen).toHaveBeenCalledOnce();
  expect(onToggleSearch).toHaveBeenCalledWith(search);
  expect(search.getAttribute('aria-controls')).toBe('find-panel');
  expect(search.getAttribute('aria-expanded')).toBe('true');
  expect(
    host.querySelector('[role="toolbar"]')?.getAttribute('aria-label'),
  ).toBe('Outils PDF');
});

it('composes the shared pagination with optional translated first/last controls', () => {
  mount({
    config: { tools: ['navigation'], boundaryButtons: true },
    text: { first: 'Début', last: 'Fin' },
  });
  expect(host.querySelector('nav.rv-pagination')).not.toBeNull();
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Fin"]')!.click(),
  );
  expect(commands.goToPage).toHaveBeenLastCalledWith(3);
  mount({ config: { tools: ['navigation'], boundaryButtons: false } });
  expect(host.querySelectorAll('nav.rv-pagination button')).toHaveLength(2);
});
