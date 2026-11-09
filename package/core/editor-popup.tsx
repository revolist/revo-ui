/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { ownsPopupTarget } from './popup-ownership';
import type { ComponentChildren } from 'preact';
import { createPreactElement, releasePreactElement } from '../preact-mount';
import { calculateEditorPopupPosition } from './editor-popup-position';
import { showTopLayerPopup, hideTopLayerPopup } from './top-layer-popup';
import './editor-popup.scss';
import { EditorCommitContext, type EditorCommit } from './editor-commit';

export interface EditorPopupHandle {
  readonly element: HTMLElement;
  close(): void;
}
export interface EditorPopupOptions {
  label: string;
  className?: string;
  /** Allow overlap with the anchor when the popup needs more vertical room. */
  fitViewport?: boolean;
  /** A separate trigger can toggle the popup without applying the draft. */
  trigger?: HTMLElement;
  onClose?: () => void;
  isAvailable?: () => boolean;
}
const sessions = new WeakMap<Document, EditorPopupHandle>();
/** Shared non-modal editor lifecycle. The anchor owns the popup across virtualization and theme inheritance. */
export function mountEditorPopup(
  anchor: HTMLElement,
  content: (close: () => void) => ComponentChildren,
  options: EditorPopupOptions,
): EditorPopupHandle {
  const document = anchor.ownerDocument;
  const view = document.defaultView!;
  sessions.get(document)?.close();
  let closed = false;
  let autoCommit: EditorCommit | undefined;
  const registerCommit = (commit: EditorCommit) => {
    autoCommit = commit;
    return () => {
      if (autoCommit === commit) autoCommit = undefined;
    };
  };
  const close = () => {
    if (closed) return;
    closed = true;
    observer.disconnect();
    resizeObserver?.disconnect();
    document.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('scroll', scroll, true);
    view.removeEventListener('resize', close);
    hideTopLayerPopup(panel, mode);
    releasePreactElement(panel);
    panel.remove();
    if (sessions.get(document)?.element === panel) sessions.delete(document);
    options.onClose?.();
    if (anchor.isConnected) anchor.focus({ preventScroll: true });
  };
  // Related portalled dropdowns are owned by a descendant trigger via aria-controls.
  const owns = (target: Node | null) => {
    if (!target) return false;
    return ownsPopupTarget(panel, target);
  };
  const outside = (event: Event) => {
    const target = event.target as Node | null;
    if (
      owns(target) ||
      anchor.contains(target) ||
      options.trigger?.contains(target)
    )
      return;
    // Only intentional outside dismissal applies drafts. Escape, virtualization,
    // read-only transitions and programmatic cleanup retain cancellation.
    if (options.isAvailable && !options.isAvailable()) {
      close();
      return;
    }
    if (autoCommit?.() === false) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    close();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // An open descendant picker gets the first Escape.
      if (panel.querySelector('[aria-expanded="true"]')) return;
      event.preventDefault();
      event.stopPropagation();
      close();
    }
    if (event.key === 'Tab' && panel.contains(event.target as Node)) {
      const fields = [
        ...panel.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[contenteditable="true"],[tabindex="0"]',
        ),
      ].filter(
        (element) => element.tabIndex >= 0 && element.getClientRects().length,
      );
      const first = fields[0],
        last = fields.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };
  const scroll = (event: Event) => {
    const target = event.target as Node | null;
    if (owns(target)) return;
    // Grid viewports and editor overlays can be siblings. Follow the owning
    // grid's automatic scroll-to-cell as well as scrolling ancestors.
    if (target && (target.contains(anchor) || grid?.contains(target)))
      positionPanel();
    // Unrelated scroll containers can update programmatically (PDFs, virtual lists).
    // They do not move the anchor or dismiss the active editor.
  };
  const panel = createPreactElement<HTMLElement>(
    document,
    <div
      class={`rv-editor-popup ${options.className ?? ''}`}
      role="dialog"
      aria-label={options.label}
      // The grid listens on document; popup drafts own their editing keys.
      onKeyDown={(event) => event.stopPropagation()}
      onKeyUp={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <EditorCommitContext.Provider value={registerCommit}>
        {content(close)}
      </EditorCommitContext.Provider>
    </div>,
  );
  panel.style.direction = view.getComputedStyle(anchor).direction;
  // Keep nested pickers inside their owning dialog so its outside-click and focus
  // handling recognizes the calendar, even while it is promoted to the top layer.
  (
    anchor.closest('dialog, [role="dialog"], [role="menu"]') ??
    anchor.closest('revo-grid') ??
    document.body
  ).append(panel);
  const mode = showTopLayerPopup(panel, 'block');
  const positionPanel = () => {
    // Measure natural height before applying the side-specific viewport constraint.
    panel.style.maxHeight = '';
    const position = calculateEditorPopupPosition(
      anchor.getBoundingClientRect(),
      panel.getBoundingClientRect(),
      { width: view.innerWidth, height: view.innerHeight },
      { fitViewport: options.fitViewport },
    );
    panel.style.maxHeight = `${position.maxHeight}px`;
    panel.style.left = `${position.left}px`;
    panel.style.top = `${position.top}px`;
    panel.dataset.placement = position.placementY;
  };
  positionPanel();
  const resizeObserver =
    typeof view.ResizeObserver === 'function'
      ? new view.ResizeObserver(positionPanel)
      : undefined;
  resizeObserver?.observe(panel);
  resizeObserver?.observe(anchor);
  const observer = new MutationObserver(() => {
    if (
      !anchor.isConnected ||
      !panel.isConnected ||
      (options.isAvailable && !options.isAvailable())
    )
      close();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  const grid = anchor.closest('revo-grid');
  if (grid && options.isAvailable) observer.observe(grid, { attributes: true });
  document.addEventListener('pointerdown', outside, true);
  document.addEventListener('keydown', keydown, true);
  document.addEventListener('scroll', scroll, true);
  view.addEventListener('resize', close);
  const handle = { element: panel, close };
  sessions.set(document, handle);
  panel
    .querySelector<HTMLElement>(
      '[autofocus],input,textarea,button,[tabindex="0"]',
    )
    ?.focus({ preventScroll: true });
  return handle;
}
