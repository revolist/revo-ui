import { h } from 'preact';
import { createPreactElement } from '../preact-mount';
import { Input } from '../native-control';

export interface FormFieldOptions {
  readonly label: string;
  readonly control: HTMLElement;
  readonly hint?: string;
  readonly className?: string;
}

export function createFormField(
  document: Document,
  options: FormFieldOptions,
): HTMLLabelElement {
  return createPreactElement(
    document,
    <label class={['rv-field', options.className].filter(Boolean).join(' ')}>
      <span class="rv-field__label">{options.label}</span>
      <span
        style={{ display: 'contents' }}
        ref={(host) => {
          if (host) host.append(options.control);
        }}
      />
      {options.hint && <span class="rv-field__hint">{options.hint}</span>}
    </label>,
  );
}
export function createTextControl(
  document: Document,
  placeholder: string,
): HTMLInputElement {
  return createPreactElement(
    document,
    <Input type="text" placeholder={placeholder} />,
  );
}
/** DOM counterpart of Dropdown; callers own its lifetime. */
export { createDropdownControl } from '../dropdown/control';
