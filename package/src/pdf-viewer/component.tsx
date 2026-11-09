import { h, type ComponentChildren } from 'preact';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Alert } from '../alert';
import { Input } from '../native-control';
import { createControlId } from '../core/control-id';
import { PdfViewerController } from './controller';
import type { PdfViewerOptions, PdfViewerState } from './types';
import { resolvePdfViewerText, type PdfViewerText } from './translations';
import {
  hasPdfTool,
  pdfToolbarOptions,
  type PdfViewerToolbarConfig,
} from './toolbar-options';
import { PdfViewerToolbar, type PdfViewerToolbarProps } from './toolbar';
import { PdfViewerSearchBar } from './search-bar';
import { PdfViewerHeader } from './header';
import { PdfViewerStatus } from './status';
import './style.scss';
export { defaultPdfViewerText, type PdfViewerText } from './translations';

export interface PdfViewerProps extends PdfViewerOptions {
  className?: string;
  height?: number | string;
  text?: Partial<PdfViewerText>;
  /** Omit for all tools, false for no toolbar, or choose individual groups. */
  toolbar?: PdfViewerToolbarConfig;
  /** Hide the filename/page summary header. */
  showHeader?: boolean;
  onReady?: (controller: PdfViewerController) => void;
  renderToolbar?: (
    controller: PdfViewerController,
    state: Readonly<PdfViewerState>,
    toolbarProps: PdfViewerToolbarProps,
  ) => ComponentChildren;
  renderStatus?: (state: Readonly<PdfViewerState>) => ComponentChildren;
}

export function PdfViewer(props: PdfViewerProps) {
  const controller = useMemo(
    () => new PdfViewerController(props),
    [
      props.workerSrc,
      props.documentOptions,
      props.initialPage,
      props.initialZoom,
      props.l10n,
    ],
  );
  return <PdfViewerView {...props} controller={controller} />;
}
/** All hosts share document lifecycle; child views own their local interaction state. */
export function PdfViewerView(
  props: PdfViewerProps & { controller: PdfViewerController },
) {
  const { controller } = props;
  const [state, setState] = useState(controller.snapshot);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchId] = useState(() => createControlId('rv-pdf-search'));
  const searchOrigin = useRef<HTMLElement | null>(null);
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const text = resolvePdfViewerText(props.text);
  const ready = state.status === 'ready';
  const buttonOptions = pdfToolbarOptions(props.toolbar).buttons;
  const enabled = (key: 'open' | 'search') => {
    const value = buttonOptions?.[key];
    return value !== false && !value?.disabled;
  };
  const canSearch = hasPdfTool(props.toolbar, 'search') && enabled('search');
  const canOpen = hasPdfTool(props.toolbar, 'open') && enabled('open');
  controller.setCallbacks(props);
  controller.setPrintTitle(text.printDocument);
  useLayoutEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    void controller.attach(viewport.current!).catch(() => {});
    props.onReady?.(controller);
    return () => {
      unsubscribe();
      controller.destroy();
    };
  }, [controller]);
  useLayoutEffect(() => {
    void controller.load(props.source ?? null, props.fileName);
  }, [controller, props.source, props.fileName]);
  const closeSearch = () => {
    controller.clearSearch();
    setSearchOpen(false);
    const origin = searchOrigin.current;
    if (origin?.isConnected && !origin.hasAttribute('disabled'))
      origin.focus({ preventScroll: true });
    else viewport.current?.focus({ preventScroll: true });
  };
  const openSearch = (origin: HTMLElement) => {
    if (!searchOpen) searchOrigin.current = origin;
    setSearchOpen(true);
    search.current?.focus();
  };
  useLayoutEffect(() => {
    if (!canSearch) {
      controller.clearSearch();
      setSearchOpen(false);
      if (searchOpen) viewport.current?.focus({ preventScroll: true });
    }
  }, [canSearch, controller]);
  const toolbarProps: PdfViewerToolbarProps = {
    controller,
    state,
    text,
    config: props.toolbar,
    searchOpen,
    searchId,
    appendTo: root.current ?? undefined,
    onOpen: () => file.current?.click(),
    onToggleSearch: (origin) =>
      searchOpen ? closeSearch() : openSearch(origin),
  };
  return (
    <section
      ref={root}
      class={`rv-pdf-viewer ${props.className ?? ''}`}
      style={{ height: props.height ?? 640 }}
      aria-label={text.viewer}
      onKeyDown={(event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === 'f' &&
          ready &&
          canSearch
        ) {
          event.preventDefault();
          openSearch(event.target as HTMLElement);
        }
      }}
    >
      {(props.showHeader !== false || state.printing) && (
        <PdfViewerHeader
          showDetails={props.showHeader !== false}
          state={state}
          text={text}
          onCancelPrint={() => controller.cancelPrint()}
        />
      )}
      {props.toolbar !== false &&
        (props.renderToolbar ? (
          props.renderToolbar(controller, state, toolbarProps)
        ) : (
          <PdfViewerToolbar {...toolbarProps} />
        ))}
      <Input
        ref={file}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        aria-label={text.open}
        onChange={(event) => {
          const selected = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (selected) void controller.load(selected);
        }}
      />
      {searchOpen && canSearch && (
        <PdfViewerSearchBar
          inputRef={search}
          id={searchId}
          controller={controller}
          state={state}
          text={text}
          onClose={closeSearch}
        />
      )}
      <div class="rv-pdf-viewer__body" aria-busy={state.status === 'loading'}>
        <div
          ref={viewport}
          class="rv-pdf-viewer__viewport"
          tabIndex={0}
          role="region"
          aria-label={text.pages}
        />
        {!ready && (
          <div class="rv-pdf-viewer__status">
            {props.renderStatus ? (
              props.renderStatus(state)
            ) : (
              <PdfViewerStatus
                state={state}
                text={text}
                controller={controller}
                canOpen={canOpen}
                onOpen={toolbarProps.onOpen}
              />
            )}
          </div>
        )}
      </div>
      {ready && state.error && (
        <Alert
          className="rv-pdf-viewer__error"
          tone="danger"
          description={text.operationError}
        />
      )}
    </section>
  );
}
