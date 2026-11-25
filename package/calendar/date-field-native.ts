import { h } from 'preact';
import type { ISODateString } from '@revolist/ui-dates';
import { PopoverController } from '../core/popover-controller';
import { findOpenDialog } from '../core/open-dialog';
import { createPreactElement, renderPreactInto } from '../preact-mount';
import { CalendarPicker } from './picker';

export interface CalendarFieldOptions {
  label: string;
  openLabel: string;
  value?: string;
  triggerClassName?: string;
  triggerIcon?: string;
  popupClassName?: string;
}
export interface CalendarFieldElement extends HTMLElement {
  value: string;
  name: string;
  readonly valueAsNumber: number;
  required: boolean;
  disabled: boolean;
  min: string;
  max: string;
  showPicker(): void;
  configure(options: CalendarFieldOptions): void;
}
const tag = 'rv-calendar-field';
/** Form-compatible native bridge over CalendarPicker; the element disposes its popup when disconnected. */
export function createCalendarField(
  document: Document,
  options: CalendarFieldOptions,
): CalendarFieldElement {
  const view = document.defaultView;
  if (!view) throw new Error('A calendar field needs a document with a window');
  const MutationObserver = view.MutationObserver;
  if (!view.customElements.get(tag)) {
    class CalendarField
      extends view.HTMLElement
      implements CalendarFieldElement
    {
      static get observedAttributes() {
        return ['name'];
      }
      attributeChangedCallback(
        name: string,
        _oldValue: string | null,
        value: string | null,
      ) {
        if (name === 'name') this.input.name = value ?? '';
      }
      private input = createPreactElement<HTMLInputElement>(this.ownerDocument, h('input', {}));
      private trigger = createPreactElement<HTMLButtonElement>(this.ownerDocument, h('button', {}));
      private picker?: PopoverController;
      private mounted = false;
      private listening = false;
      private config!: CalendarFieldOptions;
      configure(config: CalendarFieldOptions) {
        this.config = config;
        this.input.type = 'date';
        if (config.value !== undefined) {
          this.input.defaultValue = config.value;
          this.input.value = config.value;
        }
        this.input.setAttribute('aria-label', config.label);
        this.trigger.type = 'button';
        this.trigger.className = config.triggerClassName ?? '';
        if (config.triggerIcon) this.trigger.dataset.icon = config.triggerIcon;
        else delete this.trigger.dataset.icon;
        this.trigger.setAttribute('aria-label', config.openLabel);
        this.trigger.setAttribute('aria-haspopup', 'dialog');
        if (!this.listening) {
          this.trigger.addEventListener('click', () => this.open());
          this.listening = true;
        }
      }
      get name() {
        return this.getAttribute('name') ?? '';
      }
      set name(value: string) {
        this.setAttribute('name', value);
      }
      get value() {
        return this.input.value;
      }
      set value(value: string) {
        this.input.value = value;
      }
      get valueAsNumber() {
        return this.input.valueAsNumber;
      }
      get required() {
        return this.input.required;
      }
      set required(value: boolean) {
        this.input.required = value;
      }
      get disabled() {
        return this.input.disabled;
      }
      set disabled(value: boolean) {
        this.input.disabled = value;
        this.trigger.disabled = value;
        if (value) this.picker?.close(false);
      }
      get min() {
        return this.input.min;
      }
      set min(value: string) {
        this.input.min = value;
      }
      get max() {
        return this.input.max;
      }
      set max(value: string) {
        this.input.max = value;
      }
      connectedCallback() {
        if (!this.mounted) {
          this.append(this.input, this.trigger);
          this.mounted = true;
        }
      }
      disconnectedCallback() {
        this.picker?.destroy();
        this.picker = undefined;
      }
      override focus(options?: FocusOptions) {
        this.input.focus(options);
      }
      showPicker() {
        this.trigger.click();
      }
      private open() {
        if (this.disabled || this.input.matches(':disabled')) return;
        this.picker?.destroy();
        const host = createPreactElement<HTMLDivElement>(this.ownerDocument, h('div', {}));
        host.className = this.config.popupClassName ?? '';
        host.setAttribute('role', 'dialog');
        host.setAttribute('aria-label', this.config.openLabel);
        host.tabIndex = -1;
        const picker = new PopoverController();
        this.picker = picker;
        const owner = findOpenDialog(this);
        const onOwnerClose = () => picker.close();
        owner?.addEventListener('close', onOwnerClose);
        const observer = new MutationObserver(() => {
          if (this.input.matches(':disabled')) picker.close(false);
        });
        for (
          let parent = this.input.parentElement;
          parent;
          parent = parent.parentElement
        ) {
          if (parent.localName === 'fieldset')
            observer.observe(parent, {
              attributes: true,
              attributeFilter: ['disabled'],
            });
        }
        picker.open({
          anchor: this.trigger,
          content: host,
          appendTo: owner ? this : this.ownerDocument.body,
          onClose: () => {
            owner?.removeEventListener('close', onOwnerClose);
            observer.disconnect();
            queueMicrotask(() => renderPreactInto(host, null));
          },
        });
        const selected = (this.value || undefined) as ISODateString | undefined;
        const first = selected || this.max || this.min;
        renderPreactInto(
          host,
          h(CalendarPicker, {
            selected,
            ...(first
              ? { defaultMonth: `${first.slice(0, 7)}-01` as ISODateString }
              : {}),
            ...(this.min ? { minDate: this.min as ISODateString } : {}),
            ...(this.max ? { maxDate: this.max as ISODateString } : {}),
            onSelectionChange: (value: ISODateString | undefined) => {
              if (!value) return;
              if (value === this.value) {
                picker.close(true);
                return;
              }
              this.value = value;
              this.input.dispatchEvent(
                new this.ownerDocument.defaultView!.Event('input', {
                  bubbles: true,
                  composed: true,
                }),
              );
              this.input.dispatchEvent(
                new this.ownerDocument.defaultView!.Event('change', {
                  bubbles: true,
                }),
              );
              picker.close(true);
            },
          }),
        );
        (
          host.querySelector<HTMLButtonElement>(
            '.revo-calendar__day[tabindex="0"]:not([disabled])',
          ) ??
          host.querySelector<HTMLButtonElement>(
            '.revo-calendar__header button:not([disabled])',
          ) ??
          host
        ).focus({ preventScroll: true });
      }
    }
    view.customElements.define(tag, CalendarField);
  }
  const element = createPreactElement<CalendarFieldElement>(document, h(tag, {}));
  element.configure(options);
  return element;
}
