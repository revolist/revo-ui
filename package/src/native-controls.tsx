import { h } from 'preact';
import { ButtonControl } from './native-control';
import { createPreactElement } from './preact-mount';
import { renderControl } from './control-presentation';
/** Renderer-neutral controls shared by native DOM, Stencil and Preact hosts. */
export type ElementFactory = (...args: any[]) => any;

export function renderLoadingIndicator<H extends ElementFactory>(
  h: H,
  options: {
    className?: string;
    label?: string;
    ref?: (element?: HTMLElement) => void;
    showSpinner?: boolean;
  },
): ReturnType<H> {
  return h(
    'div',
    {
      class: options.className ?? 'rv-spinner',
      role: 'status',
      'aria-label': options.label,
      ref: options.ref,
    },
    options.showSpinner
      ? [h('span', { class: 'rv-spinner__ring', 'aria-hidden': 'true' })]
      : [],
  );
}

export function createButtonElement(
  document: Document,
  options: {
    label: string;
    text?: string;
    disabled?: boolean;
    className?: string;
    onClick?: (event: MouseEvent) => void;
  },
) {
  return createPreactElement<HTMLButtonElement>(
    document,
    <ButtonControl
      unstyled
      type="button"
      class={options.className ?? 'rv-btn'}
      aria-label={options.label}
      disabled={!!options.disabled}
      onClick={options.onClick}
    >
      {options.text ?? options.label}
    </ButtonControl>,
  );
}

export function renderMenuItem<H extends ElementFactory>(
  h: H,
  options: {
    label: string;
    disabled: boolean;
    submenu: boolean;
    onActivate: () => void;
    style?: string;
  },
): ReturnType<H> {
  return h(
    'button',
    {
      type: 'button',
      role: 'menuitem',
      disabled: options.disabled,
      tabIndex: -1,
      'aria-haspopup': options.submenu ? 'menu' : undefined,
      style: options.style,
      onClick: () => {
        if (!options.disabled) options.onActivate();
      },
    },
    [
      options.label,
      options.submenu
        ? h(
            'span',
            {
              'aria-hidden': 'true',
              style: 'float:inline-end;margin-inline-start:16px',
            },
            '›',
          )
        : null,
    ],
  );
}

export function renderRatingStars<H extends ElementFactory>(
  h: H,
  value: number,
  maximum = Math.max(0, Math.floor(value)),
): ReturnType<H>[] {
  const filled = Math.round(value);
  return Array.from(
    { length: Number.isFinite(maximum) ? Math.max(0, Math.floor(maximum)) : 0 },
    (_, index) =>
      h('span', {
        class: index < filled ? 'star filled-star' : 'star empty-star',
      }),
  );
}

export interface ScalarSliderOptions {
  min: number;
  max: number;
  step: number;
  value: number;
  hideValue?: boolean;
  displayValue?: string | number;
  formatValue?: (value: number) => string | number;
  thresholdClassNames?: string;
  thresholds?: readonly { value: number; className: string }[];
  label?: string;
  onChange: (value: number, event: Event) => void;
  onMouseDown?: (event: MouseEvent) => void;
}
/** Shared scalar slider presentation; edit commits and threshold policy are caller-owned. */
export function renderScalarSlider<H extends ElementFactory>(
  h: H,
  options: ScalarSliderOptions,
): ReturnType<H> {
  const percent = (value: number) =>
    options.max > options.min
      ? Math.max(
          0,
          Math.min(
            100,
            ((value - options.min) / (options.max - options.min)) * 100,
          ),
        )
      : 0;
  return h(
    'div',
    { class: `revo-slider ${options.thresholdClassNames ?? ''}` },
    [
      h(
        'div',
        { class: `revo-slider-container ${options.thresholdClassNames ?? ''}` },
        [
          h('input', {
            class: 'revo-slider-input rv-single-slider',
            style: { '--rv-single-slider-value': `${percent(options.value)}%` },
            type: 'range',
            min: options.min,
            max: options.max,
            step: options.step,
            value: options.value,
            'aria-label': options.label,
            'aria-valuetext': String(options.displayValue ?? options.value),
            onInput: (event: Event) => {
              const input = event.target as HTMLInputElement;
              input.style.setProperty(
                '--rv-single-slider-value',
                `${percent(Number(input.value))}%`,
              );
              const badge = input
                .closest('.revo-slider')
                ?.querySelector('.revo-slider-value');
              const text = String(
                options.formatValue?.(Number(input.value)) ??
                  Number(input.value),
              );
              input.setAttribute('aria-valuetext', text);
              if (badge) badge.textContent = text;
            },
            onChange: (event: Event) =>
              options.onChange(
                Number((event.target as HTMLInputElement).value),
                event,
              ),
            onMouseDown: options.onMouseDown,
          }),
          ...(options.thresholds ?? []).map((threshold) =>
            h('div', {
              class: `revo-slider-threshold ${threshold.className}`,
              style: { left: `${percent(threshold.value)}%` },
            }),
          ),
        ],
      ),
      ...(!options.hideValue
        ? [
            h(
              'span',
              {
                class: `revo-slider-value rv-badge rv-badge--inline ${options.thresholdClassNames ?? ''}`,
              },
              options.displayValue ?? options.value,
            ),
          ]
        : []),
    ],
  );
}

export interface CounterOptions {
  value: number;
  min: number;
  max: number;
  step: number;
  hideValue?: boolean;
  onChange: (value: number, event: MouseEvent) => void;
  decreaseLabel?: string;
  increaseLabel?: string;
  onMouseDown?: (event: MouseEvent) => void;
}
export function renderCounter<H extends ElementFactory>(
  h: H,
  options: CounterOptions,
): ReturnType<H> {
  const button = (delta: number, disabled: boolean, label: string) =>
    renderControl(
      h,
      'button',
      {
        class: {
          'revo-counter-button': true,
          'revo-counter-button-disabled': disabled,
        },
        type: 'button',
        'aria-label':
          delta < 0
            ? (options.decreaseLabel ?? 'Decrease value')
            : (options.increaseLabel ?? 'Increase value'),
        disabled,
        onMouseDown: options.onMouseDown,
        onClick: (event: MouseEvent) => {
          if (!disabled)
            options.onChange(
              Math.min(
                options.max,
                Math.max(options.min, options.value + delta),
              ),
              event,
            );
        },
      },
      label,
    );
  return h('div', { class: 'revo-counter' }, [
    button(-options.step, options.value <= options.min, '-'),
    ...(!options.hideValue
      ? [h('span', { class: 'revo-counter-value' }, String(options.value))]
      : []),
    button(options.step, options.value >= options.max, '+'),
  ]);
}
