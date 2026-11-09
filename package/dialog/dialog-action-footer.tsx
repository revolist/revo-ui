import { h } from 'preact';
import { ButtonControl } from '../native-control';
import { createPreactElement, releasePreactElement } from '../preact-mount';

export interface NativeDialogAction {
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
}
export interface NativeDialogActionFooterProps {
  cancel?: NativeDialogAction | false;
  save?: NativeDialogAction | false;
  deleteAction?: NativeDialogAction | false;
  reset?: NativeDialogAction | false;
}

/** One TSX composition for Preact consumers and element-returning host adapters. */
export function ActionFooterView({
  cancel = {},
  save = {},
  deleteAction = false,
  reset = false,
  start,
  end,
  children,
  actionsClass = '',
  class: className = '',
  ...props
}: Record<string, any>) {
  const action = (
    name: string,
    config: any,
    label: string,
    variant = '',
    type = 'button',
  ) => {
    if (config === false) return null;
    const {
      label: text = label,
      class: buttonClass = '',
      ...attributes
    } = config;
    return (
      <ButtonControl
        type={type as 'button'}
        {...attributes}
        class={`rv-btn ${variant} ${buttonClass}`}
        data-dialog-action={name}
      >
        {text}
      </ButtonControl>
    );
  };
  return (
    <footer
      {...props}
      class={`rv-dialog__footer rv-dialog__action-footer ${className}`}
    >
      {children}
      <div class="rv-dialog__action-panel">
        <div class="rv-dialog__action-start">
          {start}
          {action('delete', deleteAction, 'Delete', 'rv-btn-danger-outline')}
          {action('reset', reset, 'Reset')}
        </div>
        <div class={`rv-dialog__actions ${actionsClass}`}>
          {end}
          {action('cancel', cancel, 'Cancel')}
          {action('save', save, 'Save', 'rv-btn-primary', 'submit')}
        </div>
      </div>
    </footer>
  );
}

export function mountDialogActionFooter(
  host: HTMLElement,
  props: NativeDialogActionFooterProps,
) {
  const footer = createPreactElement(
    host.ownerDocument,
    <ActionFooterView {...props} />,
  );
  host.append(footer);
  return {
    destroy() {
      releasePreactElement(footer);
    },
  };
}
