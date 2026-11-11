/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { renderCellInput } from '../cell-input';
import { Button } from '../controls';
import { SvgIcon } from '../icons/icon';
import clockIcon from '@fortawesome/fontawesome-free/svgs/regular/clock.svg?raw';
import calendarIcon from '@fortawesome/fontawesome-free/svgs/regular/calendar.svg?raw';
import { createPreactElement, releasePreactElement } from '../preact-mount';
import { mountEditorPopup, type EditorPopupHandle } from '../core/editor-popup';
import { temporalInputDraft } from './keyboard-input';
import { TemporalDraft } from './field';
import { temporalPickerLabel, type TemporalPickerOptions } from './types';

const pickerAttachments = new WeakMap<HTMLInputElement, () => void>();

/** Adds or replaces the shared picker on an existing native input. */
export function attachTemporalPicker(
  input: HTMLInputElement,
  options: TemporalPickerOptions,
  commit: (value: string) => void,
): () => void {
  pickerAttachments.get(input)?.();
  let popup: EditorPopupHandle | undefined;
  const button = createPreactElement<HTMLButtonElement>(
    input.ownerDocument,
    <Button
      className="rv-temporal-picker-trigger"
      variant="ghost"
      disabled={input.disabled || input.readOnly}
      aria-label={temporalPickerLabel(options.kind ?? 'date', options.text)}
      onClick={() => {
        if (input.disabled || input.readOnly) return;
        if (popup) {
          popup.close();
          return;
        }
        popup = mountEditorPopup(
          input,
          (close) => (
            <TemporalDraft
              value={temporalInputDraft(input.value, options)}
              options={{
                ...options,
                selection: 'single',
                required:
                  options.required ??
                  options.calendar?.required ??
                  input.required,
              }}
              cancel={close}
              apply={(next) => {
                if (!input.disabled && !input.readOnly)
                  commit(typeof next === 'string' ? next : '');
                close();
              }}
            />
          ),
          {
            fitViewport: options.kind === 'datetime',
            className:
              options.kind === 'time'
                ? 'rv-editor-popup--time'
                : options.kind === 'datetime'
                  ? 'rv-editor-popup--datetime'
                  : undefined,
            label: temporalPickerLabel(options.kind ?? 'date', options.text),
            trigger: button,
            onClose: () => {
              popup = undefined;
            },
          },
        );
      }}
    >
      <SvgIcon svg={options.kind === 'time' ? clockIcon : calendarIcon} />
    </Button>,
  );
  input.after(button);
  const Observer = input.ownerDocument.defaultView?.MutationObserver;
  const observer = Observer
    ? new Observer(() => {
        button.disabled = input.disabled || input.readOnly;
        if (button.disabled) popup?.close();
      })
    : undefined;
  observer?.observe(input, {
    attributes: true,
    attributeFilter: ['disabled', 'readonly'],
  });
  const dispose = () => {
    if (pickerAttachments.get(input) !== dispose) return;
    pickerAttachments.delete(input);
    observer?.disconnect();
    popup?.close();
    releasePreactElement(button);
    button.remove();
  };
  pickerAttachments.set(input, dispose);
  return dispose;
}

/** Grid-native input with room for the same shared calendar trigger used by forms. */
export function renderTemporalCellInput<H extends (...args: any[]) => any>(
  h: H,
  attributes: Record<string, unknown>,
): ReturnType<H> {
  return h(
    'span',
    { class: 'rv-date-time-field rv-temporal-cell-input' },
    renderCellInput(h, attributes),
  );
}
