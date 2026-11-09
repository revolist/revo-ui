import { h, Fragment } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  Button,
  IconButton,
  Toolbar,
  ToolbarGroup,
  MenuItem,
  Pagination,
} from '../controls';
import { Popover } from '../pickers';
import { Input } from '../native-control';
import { Dropdown } from '../dropdown';
import { SvgIcon } from '../icons/icon';
import { pdfViewerIcons as icons } from './icons';
import type { PdfViewerController } from './controller';
import type { PdfViewerState, PdfViewerTool, PdfZoom } from './types';
import {
  resolvePdfViewerText,
  formatPdfText as format,
  type PdfViewerText,
} from './translations';
import {
  hasPdfTool,
  pdfToolbarOptions,
  type PdfViewerToolbarConfig,
  type PdfViewerButton,
} from './toolbar-options';
import './style.scss';

export interface PdfViewerToolbarProps {
  controller: PdfViewerController;
  state: Readonly<PdfViewerState>;
  config?: PdfViewerToolbarConfig;
  text?: Partial<PdfViewerText>;
  searchOpen?: boolean;
  searchId?: string;
  onOpen: () => void;
  onToggleSearch: (origin: HTMLElement) => void;
  appendTo?: HTMLElement;
}
/** PDF command composition. Registered for framework adapters without a standalone gallery preview. */
export function PdfViewerToolbar(props: PdfViewerToolbarProps) {
  const { controller, state } = props;
  const text = resolvePdfViewerText(props.text);
  const options = pdfToolbarOptions(props.config);
  const ready = state.status === 'ready';
  const shown = (button: PdfViewerButton) =>
    options.buttons?.[button] !== false;
  const buttonProps = (button: PdfViewerButton) => {
    const value = options.buttons?.[button];
    return value === false ? {} : (value ?? {});
  };
  const has = (tool: PdfViewerTool) => hasPdfTool(props.config, tool);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const moreContent = useRef<HTMLDivElement>(null);
  const [draftPage, setDraftPage] = useState(String(state.page || ''));
  const zoomStep =
    Number.isFinite(options.zoomStep) && options.zoomStep! > 1
      ? options.zoomStep!
      : 1.25;
  const levels = [
    ...new Set(
      (
        options.zoomLevels ?? [
          'page-width',
          'page-fit',
          0.5,
          0.75,
          1,
          1.25,
          1.5,
          2,
          3,
          5,
        ]
      ).filter(
        (value): value is PdfZoom =>
          value === 'page-width' ||
          value === 'page-fit' ||
          (typeof value === 'number' &&
            Number.isFinite(value) &&
            value >= 0.25 &&
            value <= 5),
      ),
    ),
  ];
  if (!levels.includes(state.zoom)) levels.push(state.zoom);
  useLayoutEffect(() => {
    setDraftPage(String(state.page || ''));
  }, [state.page, controller]);
  useLayoutEffect(() => {
    setMoreOpen(false);
  }, [props.config, ready, controller]);
  useLayoutEffect(() => {
    if (!moreOpen) return;
    moreContent.current
      ?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')
      ?.focus();
    const button = moreButton.current;
    const observer = new ResizeObserver(() => {
      if (button && !button.getClientRects().length) setMoreOpen(false);
    });
    if (button) observer.observe(button);
    return () => observer.disconnect();
  }, [moreOpen]);
  const closeMore = () => {
    setMoreOpen(false);
    moreButton.current?.focus({ preventScroll: true });
  };
  const commitPage = () => {
    if (draftPage.trim() && Number.isFinite(Number(draftPage)))
      controller.goToPage(Number(draftPage));
    setDraftPage(String(controller.snapshot.page));
  };
  if (
    !(
      [
        'open',
        'navigation',
        'zoom',
        'search',
        'rotate',
        'download',
        'print',
      ] as const
    ).some(has)
  )
    return null;
  return (
    <>
      <Toolbar
        label={text.toolbar}
        className={`rv-pdf-viewer__toolbar rv-toolbar--surface ${options.className ?? ''}`}
      >
        {has('open') && (
          <ToolbarGroup>
            <Button
              variant="ghost"
              size="compact"
              {...buttonProps('open')}
              title={buttonProps('open').title ?? text.open}
              aria-label={text.open}
              onClick={() => props.onOpen()}
            >
              <SvgIcon svg={icons.open} />
              <span class="rv-pdf-viewer__open-label">{text.open}</span>
            </Button>
          </ToolbarGroup>
        )}
        {has('navigation') &&
          (options.boundaryButtons ||
            shown('previous') ||
            shown('next') ||
            options.showPageInput !== false ||
            options.showPageCount !== false) && (
            <ToolbarGroup label={text.page}>
              <Pagination
                page={state.page - 1}
                pageCount={state.pageCount}
                onChange={(page) => controller.goToPage(page + 1)}
                label={text.page}
                previousLabel={text.previous}
                nextLabel={text.next}
                firstLabel={text.first}
                lastLabel={text.last}
                variant="icons"
                disabled={!ready}
                boundaryButtons={options.boundaryButtons}
                buttons={{
                  first: options.buttons?.first,
                  previous: options.buttons?.previous,
                  next: options.buttons?.next,
                  last: options.buttons?.last,
                }}
              >
                {options.showPageInput !== false && (
                  <Input
                    class="rv-pdf-viewer__page-input"
                    type="number"
                    min={1}
                    max={state.pageCount || 1}
                    disabled={!ready}
                    aria-label={text.page}
                    value={draftPage}
                    onInput={(event) => setDraftPage(event.currentTarget.value)}
                    onChange={commitPage}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        commitPage();
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault();
                        setDraftPage(String(state.page));
                      }
                    }}
                  />
                )}
                {options.showPageCount !== false && (
                  <span class="rv-pdf-viewer__page-count">
                    {format(text.pageCount, {
                      of: text.of,
                      pages: state.pageCount,
                    })}
                  </span>
                )}
              </Pagination>
            </ToolbarGroup>
          )}
        {has('zoom') &&
          (shown('zoomOut') ||
            shown('zoomIn') ||
            options.showZoomSelect !== false) && (
            <ToolbarGroup label={text.zoom}>
              {shown('zoomOut') && (
                <IconButton
                  {...buttonProps('zoomOut')}
                  label={text.zoomOut}
                  icon={icons.minus}
                  size="compact"
                  disabled={
                    !ready ||
                    state.scale <= 0.25 ||
                    !!buttonProps('zoomOut').disabled
                  }
                  onClick={() => controller.setZoom(state.scale / zoomStep)}
                />
              )}
              {options.showZoomSelect !== false && (
                <div class="rv-pdf-viewer__zoom-select">
                  <Dropdown
                    className="rv-select"
                    config={{
                      ariaLabel: text.zoom,
                      portalTarget: props.appendTo,
                    }}
                    disabled={!ready}
                    value={String(state.zoom)}
                    source={levels.map((value) => ({
                      value: String(value),
                      label:
                        value === 'page-width'
                          ? text.fitWidth
                          : value === 'page-fit'
                            ? text.fitPage
                            : format(text.zoomPercentage, {
                                percent: Math.round(value * 100),
                              }),
                    }))}
                    onChange={(next) => {
                      const value = String(next);
                      controller.setZoom(
                        value === 'page-fit' || value === 'page-width'
                          ? value
                          : Number(value),
                      );
                    }}
                  />
                </div>
              )}
              {shown('zoomIn') && (
                <IconButton
                  {...buttonProps('zoomIn')}
                  label={text.zoomIn}
                  icon={icons.plus}
                  size="compact"
                  disabled={
                    !ready ||
                    state.scale >= 5 ||
                    !!buttonProps('zoomIn').disabled
                  }
                  onClick={() => controller.setZoom(state.scale * zoomStep)}
                />
              )}
            </ToolbarGroup>
          )}
        {has('search') && (
          <ToolbarGroup>
            {shown('search') && (
              <IconButton
                {...buttonProps('search')}
                label={text.search}
                icon={icons.search}
                size="compact"
                disabled={!ready || !!buttonProps('search').disabled}
                aria-expanded={props.searchOpen}
                aria-controls={props.searchId}
                aria-keyshortcuts="Control+f Meta+f"
                onClick={(event) => props.onToggleSearch(event.currentTarget)}
              />
            )}
          </ToolbarGroup>
        )}
        {(has('rotate') || has('download') || has('print')) && (
          <ToolbarGroup className="rv-pdf-viewer__actions rv-pdf-viewer__desktop-actions">
            {has('rotate') && (
              <IconButton
                {...buttonProps('rotate')}
                label={text.rotate}
                icon={icons.rotate}
                size="compact"
                disabled={!ready || !!buttonProps('rotate').disabled}
                onClick={() => controller.rotate()}
              />
            )}
            {has('download') && (
              <IconButton
                {...buttonProps('download')}
                label={text.download}
                icon={icons.download}
                size="compact"
                disabled={!ready || !!buttonProps('download').disabled}
                onClick={() => void controller.download()}
              />
            )}
            {has('print') && (
              <IconButton
                {...buttonProps('print')}
                label={text.print}
                icon={icons.print}
                size="compact"
                disabled={
                  !ready || state.printing || !!buttonProps('print').disabled
                }
                busy={state.printing}
                onClick={() => void controller.print()}
              />
            )}
          </ToolbarGroup>
        )}
        {(has('rotate') || has('download') || has('print')) && (
          <ToolbarGroup className="rv-pdf-viewer__more">
            <Button
              ref={moreButton}
              variant="ghost"
              size="compact"
              className="rv-btn-icon"
              title={text.more}
              aria-label={text.more}
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              disabled={!ready}
              onClick={() => setMoreOpen(!moreOpen)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setMoreOpen(true);
                }
              }}
            >
              <SvgIcon svg={icons.more} />
            </Button>
          </ToolbarGroup>
        )}
      </Toolbar>
      <Popover
        open={moreOpen}
        anchor={moreButton.current}
        appendTo={props.appendTo}
        onClose={() => setMoreOpen(false)}
        role="menu"
        label={text.more}
      >
        <div ref={moreContent} class="rv-pdf-viewer__menu">
          {has('rotate') && (
            <MenuItem
              className={buttonProps('rotate').className}
              disabled={!!buttonProps('rotate').disabled}
              onClick={() => {
                controller.rotate();
                closeMore();
              }}
            >
              <SvgIcon svg={icons.rotate} />
              {text.rotate}
            </MenuItem>
          )}
          {has('download') && (
            <MenuItem
              className={buttonProps('download').className}
              disabled={!!buttonProps('download').disabled}
              onClick={() => {
                void controller.download();
                closeMore();
              }}
            >
              <SvgIcon svg={icons.download} />
              {text.download}
            </MenuItem>
          )}
          {has('print') && (
            <MenuItem
              className={buttonProps('print').className}
              disabled={state.printing || !!buttonProps('print').disabled}
              onClick={() => {
                void controller.print();
                closeMore();
              }}
            >
              <SvgIcon svg={icons.print} />
              {text.print}
            </MenuItem>
          )}
        </div>
      </Popover>
    </>
  );
}
