import { h } from 'preact';
import { createPreactElement } from '../preact-mount';
import { ButtonControl } from '../native-control';
import {
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogActions,
  DialogCloseButton,
} from './dialog.parts';
import type { DialogButtonVariant, DialogOpenOptions } from './dialog.types';

export interface DialogElements {
  readonly root: HTMLElement;
  readonly surface: HTMLElement;
  readonly header: HTMLElement;
  readonly body: HTMLElement;
  readonly footer: HTMLElement;
  readonly actions: HTMLElement;
}

/** Element-returning native API; shared TSX owns the entire dialog chrome. */
export function createDialogElements(
  document: Document,
  options: DialogOpenOptions,
  close: () => void,
): DialogElements {
  const titleId = nextDialogTitleId();
  let surface!: HTMLElement,
    header!: HTMLElement,
    body!: HTMLElement,
    footer!: HTMLElement,
    actions!: HTMLElement;
  const root = createPreactElement(
    document,
    <div
      class={['rv-dialog-overlay', options.overlayClass]
        .filter(Boolean)
        .join(' ')}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={options.ariaDescribedBy}
      tabIndex={-1}
    >
      <section
        ref={(element: HTMLElement | null) => {
          surface = element!;
        }}
        class={['rv-dialog__surface', options.surfaceClass]
          .filter(Boolean)
          .join(' ')}
      >
        <DialogHeader
          ref={(element: HTMLElement | null) => {
            header = element!;
          }}
        >
          <div class="rv-dialog__heading">
            <h3 id={titleId} class="rv-dialog__title">
              {options.title}
            </h3>
          </div>
          <DialogCloseButton
            aria-label={options.closeLabel}
            title={options.closeLabel}
            onClick={close}
          />
        </DialogHeader>
        <DialogBody
          ref={(element: HTMLElement | null) => {
            body = element!;
          }}
        />
        <DialogFooter
          ref={(element: HTMLElement | null) => {
            footer = element!;
          }}
        >
          <DialogActions
            ref={(element: HTMLElement | null) => {
              actions = element!;
            }}
          />
        </DialogFooter>
      </section>
    </div>,
  );
  return { root, surface, header, body, footer, actions };
}

export function createDialogCloseButton(
  document: Document,
  label: string,
  close: () => void,
): HTMLButtonElement {
  return createPreactElement(
    document,
    <DialogCloseButton aria-label={label} title={label} onClick={close} />,
  );
}

export function createDialogButton(
  document: Document,
  label: string,
  action: () => void,
  variant: DialogButtonVariant = 'default',
): HTMLButtonElement {
  return createPreactElement(
    document,
    <ButtonControl
      title={label || undefined}
      class={variant === 'default' ? 'rv-btn' : `rv-btn-${variant}`}
      onClick={action}
    >
      {label}
    </ButtonControl>,
  );
}

let dialogTitleId = 0;

function nextDialogTitleId(): string {
  dialogTitleId += 1;
  return `rv-dialog-title-${dialogTitleId}`;
}

export function trapDialogFocus(root: HTMLElement, event: KeyboardEvent): void {
  const focusable = getDialogFocusableElements(root);
  if (!focusable.length) {
    event.preventDefault();
    root.focus();
    return;
  }
  const active = root.ownerDocument.activeElement;
  const currentIndex = focusable.findIndex((element) => element === active);
  const nextIndex =
    currentIndex < 0
      ? event.shiftKey
        ? focusable.length - 1
        : 0
      : event.shiftKey
        ? (currentIndex - 1 + focusable.length) % focusable.length
        : (currentIndex + 1) % focusable.length;
  event.preventDefault();
  focusable[nextIndex].focus();
}

export function getDialogFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], area[href], button:not([disabled]), ' +
        'input:not([disabled]):not([type="hidden"]), select:not([disabled]), ' +
        'textarea:not([disabled]), iframe, object, embed, ' +
        'summary, audio[controls], video[controls], ' +
        '[contenteditable]:not([contenteditable="false"]), ' +
        '[tabindex]:not([tabindex="-1"])',
    ),
  ).filter(
    (element) =>
      !element.hidden &&
      !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
      !element.matches('[tabindex="-1"], :disabled, input[type="hidden"]'),
  );
}
