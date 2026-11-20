import type { ClassPreset } from '../presets/types';
import { ActionFooterView } from './dialog-action-footer';
/** @jsxImportSource preact */
import { h, Fragment, type JSX } from 'preact';
import { forwardRef } from 'preact/compat';
import xmarkIcon from '@fortawesome/fontawesome-free/svgs/solid/xmark.svg?raw';
import { Input, ButtonControl } from '../native-control';

/** Composable chrome: consumers retain native dialog lifecycle and form policy. */
export const DialogHeader = forwardRef<
  HTMLElement,
  JSX.IntrinsicElements['header'] & { preset?: ClassPreset }
>(({ preset, class: className = '', ...props }, ref) => (
  <header
    {...props}
    ref={ref}
    class={`rv-dialog__header ${preset?.className ?? ''} ${className}`}
    data-part="root"
  />
));
export function DialogForm({
  preset,
  class: className = '',
  ...props
}: JSX.IntrinsicElements['form'] & { preset?: ClassPreset }) {
  return (
    <form
      {...props}
      class={`rv-dialog__surface ${preset?.className ?? ''} ${className}`}
      data-part="root"
    />
  );
}
export const DialogBody = forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div'] & { preset?: ClassPreset }
>(({ preset, class: className = '', ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    class={`rv-dialog__body ${preset?.className ?? ''} ${className}`}
    data-part="root"
  />
));
export const DialogFooter = forwardRef<
  HTMLElement,
  JSX.IntrinsicElements['footer'] & { preset?: ClassPreset }
>(({ preset, class: className = '', ...props }, ref) => (
  <footer
    {...props}
    ref={ref}
    class={`rv-dialog__footer ${preset?.className ?? ''} ${className}`}
    data-part="root"
  />
));
export const DialogActions = forwardRef<
  HTMLDivElement,
  JSX.IntrinsicElements['div'] & { preset?: ClassPreset }
>(({ preset, class: className = '', ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    class={`rv-dialog__actions ${preset?.className ?? ''} ${className}`}
    data-part="root"
  />
));
export function DialogCloseButton({
  preset,
  class: className = '',
  iconClass = '',
  ...props
}: Omit<JSX.IntrinsicElements['button'], 'ref'> & {
  'aria-label': string;
  preset?: ClassPreset;
  iconClass?: string;
}) {
  return (
    <ButtonControl
      {...props}
      preset={preset}
      data-part="root"
      unstyled
      type="button"
      class={`rv-dialog__close ${className}`}
    >
      <span
        class={`rv-dialog__close-icon ${iconClass}`}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: xmarkIcon }}
      />
    </ButtonControl>
  );
}
/** A native input with shared title styling; labels and commit policy stay explicit. */
export const DialogTitleInput = forwardRef<
  HTMLInputElement,
  Omit<JSX.IntrinsicElements['input'], 'ref'> & { preset?: ClassPreset }
>(({ preset, class: className = '', ...props }, ref) => (
  <Input
    {...props}
    preset={preset}
    ref={ref}
    class={`rv-dialog__title-input ${className}`}
  />
));

export interface EditableDialogHeaderProps extends Omit<
  JSX.IntrinsicElements['header'],
  'title'
> {
  readonly preset?: ClassPreset;
  readonly titleId: string;
  readonly title: string;
  /** Optional dialog name above the editable item title. */
  readonly name?: string;
  readonly description?: import('preact').ComponentChildren;
  readonly inputLabel: string;
  readonly titleHidden?: boolean;
  readonly headingClass?: string;
  readonly kickerClass?: string;
  readonly titleClass?: string;
  /** false renders a static title while retaining the same header layout. */
  readonly inputProps?:
    | false
    | (Omit<JSX.IntrinsicElements['input'], 'ref'> & {
        [attribute: `data-${string}`]: unknown;
      });
  readonly closeLabel: string;
  readonly closeProps?: Omit<JSX.IntrinsicElements['button'], 'ref'>;
  readonly onClose?: () => void;
}

/** One owner for editable item names, dialog captions, close actions and spacing. */
export const EditableDialogHeader = forwardRef<
  HTMLElement,
  EditableDialogHeaderProps
>(
  (
    {
      preset,
      titleId,
      title,
      name,
      description,
      inputLabel,
      titleHidden,
      headingClass = '',
      kickerClass = '',
      titleClass = '',
      inputProps,
      closeLabel,
      closeProps,
      onClose,
      class: className = '',
      ...props
    },
    ref,
  ) => (
    <DialogHeader
      {...props}
      preset={preset}
      ref={ref}
      class={`rv-dialog__header--editable ${className}`}
    >
      <div class={`rv-dialog__heading ${headingClass}`}>
        {!titleHidden && name && (
          <span class={`rv-dialog__kicker ${kickerClass}`}>{name}</span>
        )}
        {!titleHidden &&
          (inputProps === false ? (
            <h3 id={titleId} class={`rv-dialog__title ${titleClass}`}>
              {title}
            </h3>
          ) : (
            <>
              <h3 id={titleId} class={`rv-dialog__sr-only ${titleClass}`}>
                {title}
              </h3>
              <DialogTitleInput
                aria-label={inputLabel}
                value={title}
                {...inputProps}
              />
            </>
          ))}
        {description && <div class="rv-dialog__description">{description}</div>}
      </div>
      {onClose && (
        <DialogCloseButton
          {...closeProps}
          aria-label={closeLabel}
          onClick={onClose}
        />
      )}
    </DialogHeader>
  ),
);

export type DialogAction = Omit<
  JSX.IntrinsicElements['button'],
  'children' | 'ref'
> & {
  readonly label?: import('preact').ComponentChildren;
  [attribute: `data-${string}`]: unknown;
};
export type DialogActionFooterProps = JSX.IntrinsicElements['footer'] & {
  readonly preset?: ClassPreset;
  readonly cancel?: DialogAction | false;
  readonly save?: DialogAction | false;
  readonly deleteAction?: DialogAction | false;
  readonly reset?: DialogAction | false;
  /** Custom actions on either side of the standard bottom panel. */
  readonly start?: import('preact').ComponentChildren;
  readonly end?: import('preact').ComponentChildren;
  readonly actionsClass?: string;
};

/** Default Cancel/Save, opt-in Delete/Reset; false hides any standard action. */
export function DialogActionFooter(props: DialogActionFooterProps) {
  return <ActionFooterView {...props} />;
}
