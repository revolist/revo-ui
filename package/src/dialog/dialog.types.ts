export interface DialogOpenOptions {
  readonly title: string;
  readonly closeLabel: string;
  /** ID of visible supporting copy that describes the dialog purpose. */
  readonly ariaDescribedBy?: string;
  readonly draggable?: boolean;
  readonly popupOwner?: object;
  readonly overlayClass?: string;
  readonly surfaceClass?: string;
  /** Explicit final focus target. Falls back to the previously focused live element. */
  readonly returnFocus?: HTMLElement;
  /** Called exactly once after the dialog is removed by any close mechanism. */
  readonly onClose?: () => void;
}

export interface DialogHandle {
  readonly root: HTMLElement;
  readonly surface: HTMLElement;
  readonly header: HTMLElement;
  readonly body: HTMLElement;
  readonly footer: HTMLElement;
  readonly actions: HTMLElement;
  close(): void;
}

export type DialogButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'danger-outline'
  | 'ghost';
