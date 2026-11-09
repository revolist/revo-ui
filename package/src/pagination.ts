import {
  createDropdownControl,
  type DropdownControl,
} from './dropdown/control';
import { renderControl, controlClassName } from './control-presentation';
export type PaginationItem = number | 'ellipsis';
/** A bounded page window with first/last anchors and no redundant ellipses. */
export function paginationItems(
  page: number,
  pageCount: number,
  count = 5,
): PaginationItem[] {
  const total = Math.max(0, Math.floor(pageCount));
  if (!Number.isFinite(total) || !total) return [];
  const size = Math.min(total, Math.max(1, Math.floor(count) || 5));
  const current = Math.min(total - 1, Math.max(0, Math.floor(page) || 0));
  const start = Math.min(
    Math.max(0, current - Math.floor(size / 2)),
    total - size,
  );
  const pages = new Set([0, total - 1]);
  for (let i = start; i < start + size; i++) pages.add(i);
  const result: PaginationItem[] = [];
  let previous = -1;
  for (const value of [...pages].sort((a, b) => a - b)) {
    if (previous >= 0 && value - previous === 2) result.push(previous + 1);
    else if (previous >= 0 && value - previous > 2) result.push('ellipsis');
    result.push(value);
    previous = value;
  }
  return result;
}
export function renderPaginationButton<T>(
  h: PaginationElementFactory<T>,
  options: {
    text: string;
    label?: string;
    kind?: 'first' | 'previous' | 'next' | 'last';
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
  },
) {
  const paths = {
    first: 'M11 6l-6 6 6 6M19 6l-6 6 6 6',
    previous: 'M15 6l-6 6 6 6',
    next: 'M9 6l6 6-6 6',
    last: 'M5 6l6 6-6 6M13 6l6 6-6 6',
  };
  return renderControl(
    h,
    'button',
    {
      class: controlClassName(
        'rv-button small rv-pagination-button rv-btn-ghost',
        {
          'rv-pagination-button--icon': !!options.kind,
          disabled: options.disabled,
        },
      ),
      disabled: options.disabled,
      'aria-label': options.label,
      'aria-current': options.active ? 'page' : undefined,
      onClick: options.onClick,
    },
    ...(options.kind
      ? [
          h(
            'svg',
            {
              viewBox: '0 0 24 24',
              width: 16,
              height: 16,
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': 1.8,
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round',
              'aria-hidden': 'true',
              class: 'rv-pagination-chevron',
            },
            h('path', { d: paths[options.kind] }),
          ),
          h(
            'span',
            { class: 'rv-pagination-sr', 'aria-hidden': 'true' },
            options.text,
          ),
        ]
      : [options.text]),
  );
}
export type PaginationElementFactory<T> = (...args: any[]) => T;
export interface PaginationViewConfig {
  itemsPerPage: number;
  initialPage: number;
  total: number;
  buttonCount?: number;
  info?: boolean;
  totalInfo?: boolean;
  pageSizes?: boolean | number[];
  position?: 'top' | 'bottom';
  navigation?: boolean;
  /** Show first/last navigation buttons. Defaults to true for the native panel. */
  boundaryButtons?: boolean;
  locales?: {
    previous?: string;
    next?: string;
    first?: string;
    last?: string;
    page?: string;
    of?: string;
    items?: string;
    loading?: string;
  };
}
/** Renderer-neutral pagination state and presentation. Remote loading stays with the host. */
export class PaginationPanel<T = any> {
  private config: PaginationViewConfig = {
    itemsPerPage: 0,
    initialPage: 0,
    total: 0,
  };
  private currentPage = 0;
  private loading = false;
  private totalPages = 0;
  private locales: Required<Required<PaginationViewConfig>['locales']> = {
    previous: '‹',
    next: '›',
    first: '«',
    last: '»',
    page: 'Page',
    of: 'of',
    items: 'items',
    loading: 'Loading…',
  };
  private selector?: DropdownControl;
  private readonly selectorRef = (host: HTMLElement | null) => {
    if (!host) {
      this.selector?.destroy();
      this.selector = undefined;
      return;
    }
    if (!this.selector) {
      this.selector = createDropdownControl(
        host.ownerDocument,
        this.selectorProps(),
      );
      host.append(this.selector.element);
    }
  };
  private selectorProps() {
    return {
      config: { ariaLabel: this.locales.page },
      value: String(this.currentPage),
      source: Array.from({ length: this.totalPages }, (_, i) => ({
        value: String(i),
        label: String(i + 1),
      })),
      onChange: (value: string | string[]) => this.setPage(Number(value)),
    };
  }
  refresh?: () => void;

  constructor(
    config: PaginationViewConfig,
    private onPageChange: (page: number) => void,
    private readonly h: PaginationElementFactory<T>,
  ) {
    this.update(config);
  }

  setLoading(loading: boolean) {
    if (this.loading === loading) return;
    this.loading = loading;
    this.refresh?.();
  }

  setRefresh(refresh?: () => void) {
    this.refresh = refresh;
  }

  setPage(page: number, emitChange = true) {
    const lastPage = Math.max(0, this.totalPages - 1);
    const nextPage = Math.min(Math.max(0, page), lastPage);
    this.currentPage = nextPage;
    this.refresh?.();
    if (emitChange) {
      this.onPageChange(this.currentPage);
    }
  }

  private createButton(
    textContent: string,
    onClick: () => void,
    disabled: boolean,
    kind: 'first' | 'previous' | 'next' | 'last',
  ) {
    const defaults = {
      first: '«',
      previous: '‹',
      next: '›',
      last: '»',
    } as const;
    const label =
      defaults[kind] === textContent
        ? {
            first: 'First page',
            previous: 'Previous page',
            next: 'Next page',
            last: 'Last page',
          }[kind]
        : textContent;
    return renderPaginationButton(this.h, {
      text: textContent,
      label,
      kind,
      disabled,
      onClick: () => onClick.call(this),
    });
  }

  render() {
    this.selector?.update(this.selectorProps());
    const h = this.h;
    const buttons: T[] = [];
    if (this.config.navigation !== false) {
      buttons.push(
        // first button
        ...(this.config.boundaryButtons === false
          ? []
          : [
              this.createButton(
                this.locales.first,
                () => {
                  if (this.currentPage > 0) {
                    this.setPage(0);
                  }
                },
                this.currentPage === 0,
                'first',
              ),
            ]),

        // previous button
        this.createButton(
          this.locales.previous,
          () => {
            if (this.currentPage > 0) {
              this.setPage(this.currentPage - 1);
            }
          },
          this.currentPage === 0,
          'previous',
        ),
      );

      // button line for pagination
      if (this.config.buttonCount) {
        for (const item of paginationItems(
          this.currentPage,
          this.totalPages,
          this.config.buttonCount,
        )) {
          if (item === 'ellipsis')
            buttons.push(
              h(
                'span',
                { class: 'rv-pagination-ellipsis', 'aria-hidden': 'true' },
                '…',
              ),
            );
          else
            buttons.push(
              renderPaginationButton(h, {
                text: String(item + 1),
                label: `${this.locales.page} ${item + 1}`,
                active: item === this.currentPage,
                disabled: item === this.currentPage,
                onClick: () => this.setPage(item),
              }),
            );
        }
      }
      buttons.push(
        // next button
        this.createButton(
          this.locales.next,
          () => {
            if (this.currentPage < this.totalPages - 1) {
              this.setPage(this.currentPage + 1);
            }
          },
          this.currentPage >= this.totalPages - 1,
          'next',
        ),

        // last button
        ...(this.config.boundaryButtons === false
          ? []
          : [
              this.createButton(
                this.locales.last,
                () => {
                  this.setPage(this.totalPages - 1);
                },
                this.currentPage >= this.totalPages - 1,
                'last',
              ),
            ]),
      );
    }

    if (this.totalPages > 1) {
      const selector: T[] = [];
      if (this.config.info !== false) {
        selector.push(
          h('span', { class: 'rv-pagination-label' }, this.locales.page),
        );
      }
      selector.push(
        h('span', { class: 'rv-pagination-dropdown', ref: this.selectorRef }),
      );
      if (this.config.info !== false) {
        selector.push(
          // of
          h('span', null, ` ${this.locales.of} ${this.totalPages}`),
        );
      }
      buttons.push(h('span', { class: 'rv-pagination-selector' }, selector));
    }
    if (this.loading) {
      buttons.push(
        h(
          'span',
          { role: 'status', 'aria-live': 'polite' },
          this.locales.loading,
        ),
      );
    }
    const rightCorner: T[] = [];
    if (this.config.totalInfo !== false) {
      const start =
        this.config.total > 0 && this.config.itemsPerPage > 0
          ? this.currentPage * this.config.itemsPerPage + 1
          : 0;
      const end = Math.min(
        (this.currentPage + 1) * this.config.itemsPerPage,
        this.config.total,
      );
      rightCorner.push(
        // total info
        h(
          'span',
          { dir: 'auto' },
          `${start}-${end} ${this.locales.of} ${this.config.total} ${this.locales.items}`,
        ),
      );
    }
    return h(
      'div',
      {
        class: 'rv-pagination-panel',
        role: 'navigation',
        'aria-label': this.locales.page,
      },
      [h('span', null, buttons), h('span', null, rightCorner)],
    );
  }

  update(config: PaginationViewConfig) {
    const nextTotalPages =
      config.itemsPerPage > 0 && Number.isFinite(config.total)
        ? Math.max(0, Math.ceil(config.total / config.itemsPerPage))
        : 0;
    const initialPageChanged = config.initialPage !== this.config.initialPage;

    if (initialPageChanged) {
      this.currentPage = Math.min(
        Math.max(0, Math.floor(config.initialPage) || 0),
        Math.max(0, nextTotalPages - 1),
      );
    } else if (!nextTotalPages) {
      this.currentPage = 0;
    } else {
      this.currentPage = Math.min(this.currentPage, nextTotalPages - 1);
    }

    this.totalPages = nextTotalPages;
    this.config = config;
    this.locales = {
      ...this.locales,
      ...config.locales,
    };
    this.refresh?.();
  }
}
