import { h } from 'preact';
import { ButtonControl } from '../native-control';
import { renderPreactInto } from '../preact-mount';

export interface NativeDialogAction {
  label?: string;
  disabled?: boolean;
  onClick?: () => void;
  /** Optional icon identifier exposed to the host's icon styling. */
  icon?: string;
}
export interface NativeDialogActionFooterProps {
  cancel?: NativeDialogAction | false;
  save?: NativeDialogAction | false;
  deleteAction?: NativeDialogAction | false;
  reset?: NativeDialogAction | false;
  className?: string;
  actionsClass?: string;
}

/** One TSX composition for Preact consumers and element-returning host adapters. */
export function ActionFooterView({
  preset,
  cancel = {},
  save = {},
  deleteAction = false,
  reset = false,
  start,
  end,
  children,
  actionsClass = '',
  class: className = '',
  className: nativeClassName = '',
  startRef,
  endRef,
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
      icon,
      ...attributes
    } = config;
    return (
      <ButtonControl
        type={type as 'button'}
        {...attributes}
        class={`rv-btn ${variant} ${buttonClass}`}
        data-icon={icon}
        data-dialog-action={name}
      >
        {text}
      </ButtonControl>
    );
  };
  return (
    <footer
      {...props}
      class={`rv-dialog__footer rv-dialog__action-footer ${preset?.className ?? ''} ${className} ${nativeClassName}`}
      data-part="root"
    >
      {children}
      <div class="rv-dialog__action-panel">
        <div ref={startRef} class="rv-dialog__action-start">
          {start}
          {action('delete', deleteAction, 'Delete', 'rv-btn-danger-outline')}
          {action('reset', reset, 'Reset')}
        </div>
        <div class={`rv-dialog__actions ${actionsClass}`}>
          {endRef ? <span ref={endRef} style={{ display: 'contents' }}>{end}</span> : end}
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
  const container = host.ownerDocument.createElement('div');
  container.style.display = 'contents';
  host.append(container);
  let current = props;
  let start!: HTMLElement;
  let end!: HTMLElement;
  let destroyed = false;
  const startRef = (element: HTMLElement | null) => { if (element) start = element; };
  const endRef = (element: HTMLElement | null) => { if (element) end = element; };
  const render = () => renderPreactInto(container, <ActionFooterView {...current} startRef={startRef} endRef={endRef} />);
  render();
  const element = container.firstElementChild as HTMLElement;
  return {
    element,
    start,
    end,
    /** Replace supplied action configurations; omitted fields stay unchanged. */
    update(next: Partial<NativeDialogActionFooterProps>) {
      if (destroyed) return;
      current = { ...current, ...next };
      render();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      renderPreactInto(container, null);
      container.remove();
    },
  };
}
