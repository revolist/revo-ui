import { h } from 'preact';
import { Alert, type AlertProps } from './alert';
import {
  createPreactElement,
  releasePreactElement,
  renderPreactInto,
} from './preact-mount';

export type NativeAlertProps = AlertProps & { content?: string | Node };

/** Stateful native mount boundary. Preact owns the shared alert and its updates. */
export function renderAlertInto(
  host: HTMLElement,
  { content, ...props }: NativeAlertProps,
): void {
  renderPreactInto(
    host,
    <Alert {...props}>
      {content === undefined ? (
        props.children
      ) : typeof content === 'string' ? (
        content
      ) : (
        <span
          ref={(element) => {
            if (element) element.replaceChildren(content);
          }}
        />
      )}
    </Alert>,
  );
}

export function createAlertElement(
  document: Document,
  props: NativeAlertProps,
): HTMLElement {
  const host = createPreactElement<HTMLElement>(document, <div />);
  renderAlertInto(host, props);
  return host;
}

export function releaseAlertElement(host: HTMLElement): void {
  renderPreactInto(host, null);
  releasePreactElement(host);
}
