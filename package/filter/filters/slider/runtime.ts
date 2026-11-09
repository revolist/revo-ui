import {
  prepareTooltipSurface,
  showTopLayerPopup,
  hideTopLayerPopup,
  type TopLayerPopupMode,
} from '../../../core/top-layer-popup';
import {
  claimTooltip,
  releaseTooltip,
} from '@revolist/chart-utils/tooltip-owner';
import { createControlId } from '../../../core/control-id';
import type { RangeSliderProps } from './types';
import {
  toSliderRange,
  unscaleSliderValue,
  type ScaledSliderState,
} from './logic';

export type RangeSliderRefs = {
  fromSlider?: HTMLInputElement;
  toSlider?: HTMLInputElement;
  fromInput?: HTMLInputElement;
  toInput?: HTMLInputElement;
  fromLabel?: HTMLSpanElement;
  toLabel?: HTMLSpanElement;
  fromTooltip?: HTMLDivElement;
  toTooltip?: HTMLDivElement;
};

export type RangeSliderRuntime = {
  refs: RangeSliderRefs;
  state: ScaledSliderState;
  scaleFactor: number;
  nativeStep: number;
  formatValue: NonNullable<RangeSliderProps['formatValue']>;
  formatFromValue: NonNullable<RangeSliderProps['formatValue']>;
  formatToValue: NonNullable<RangeSliderProps['formatValue']>;
  formatInputValue: NonNullable<RangeSliderProps['formatInputValue']>;
  parseInputValue: NonNullable<RangeSliderProps['parseInputValue']>;
  showTooltips: boolean;
  onRangeChange: RangeSliderProps['onRangeChange'];
  onRangeCommit?: RangeSliderProps['onRangeCommit'];
  disabled: boolean;
  controlClassName?: string;
  fromClassName?: string;
  toClassName?: string;
  fromAriaLabel?: string;
  toAriaLabel?: string;
  scheduleSyncVisuals: () => void;
  syncVisuals: () => void;
};

export function getCurrentRange(runtime: RangeSliderRuntime) {
  return toSliderRange(
    Number(runtime.refs.fromSlider?.value ?? runtime.state.fromValueInt),
    Number(runtime.refs.toSlider?.value ?? runtime.state.toValueInt),
    runtime.scaleFactor,
  );
}

export function syncRangeText(runtime: RangeSliderRuntime) {
  const { fromValue, toValue } = getCurrentRange(runtime);
  const fromText = runtime.formatFromValue(fromValue);
  const toText = runtime.formatToValue(toValue);

  if (runtime.refs.fromLabel) {
    runtime.refs.fromLabel.textContent = fromText;
  }
  if (runtime.refs.toLabel) {
    runtime.refs.toLabel.textContent = toText;
  }
  if (runtime.refs.fromInput) {
    runtime.refs.fromInput.value = runtime.formatInputValue(fromValue);
  }
  if (runtime.refs.toInput) {
    runtime.refs.toInput.value = runtime.formatInputValue(toValue);
  }
  runtime.refs.fromSlider?.setAttribute('aria-valuetext', fromText);
  runtime.refs.toSlider?.setAttribute('aria-valuetext', toText);
}

const tooltipModes = new WeakMap<
  HTMLElement,
  {
    mode: TopLayerPopupMode;
    slider: HTMLInputElement;
    original: string | null;
    disconnect?: () => void;
  }
>();

export function updateTooltip(
  slider: HTMLInputElement,
  tooltip: HTMLDivElement,
  state: ScaledSliderState,
  formatValue: NonNullable<RangeSliderProps['formatValue']>,
  scaleFactor = 100,
) {
  const value = unscaleSliderValue(Number(slider.value), scaleFactor);
  tooltip.textContent = formatValue(value);
  prepareTooltipSurface(tooltip);
  if (!tooltipModes.has(tooltip)) {
    tooltip.id ||= createControlId('rv-tooltip');
    const original = slider.getAttribute('aria-describedby');
    slider.setAttribute(
      'aria-describedby',
      [original, tooltip.id].filter(Boolean).join(' '),
    );
    tooltip.hidden = false;
    Object.assign(tooltip.style, {
      position: 'fixed',
      inset: 'auto',
      margin: '0',
      transform: 'none',
    });
    const mode = showTopLayerPopup(tooltip, 'block');
    const Observer = slider.ownerDocument.defaultView?.MutationObserver;
    const observer = Observer
      ? new Observer(() => {
          if (!slider.isConnected) hideTooltip(tooltip);
        })
      : undefined;
    observer?.observe(slider.ownerDocument, { childList: true, subtree: true });
    tooltipModes.set(tooltip, {
      mode,
      slider,
      original,
      disconnect: () => observer?.disconnect(),
    });
    claimTooltip(slider.ownerDocument, tooltip, () => hideTooltip(tooltip));
  }

  const rangeDistance = state.maxInt - state.minInt || 1;
  const percent = ((Number(slider.value) - state.minInt) / rangeDistance) * 100;
  const parentRect = tooltip.parentElement?.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  if (parentRect && tooltipRect) {
    tooltip.style.left = `${
      parentRect.left +
      getTooltipCenterPosition(percent, parentRect.width, tooltipRect.width) -
      tooltipRect.width / 2
    }px`;
    tooltip.style.top = `${Math.max(8, parentRect.top - tooltipRect.height - 8)}px`;
  } else {
    tooltip.style.left = `${percent}%`;
  }

  tooltip.style.opacity = '1';
}

export function getTooltipCenterPosition(
  percent: number,
  parentWidth: number,
  tooltipWidth: number,
  edgePadding = 8,
) {
  const halfTooltip = tooltipWidth / 2;
  const minCenter = edgePadding + halfTooltip;
  const maxCenter = parentWidth - edgePadding - halfTooltip;

  if (minCenter > maxCenter) {
    return parentWidth / 2;
  }

  const preferredCenter =
    (Math.min(Math.max(percent, 0), 100) / 100) * parentWidth;
  return Math.min(Math.max(preferredCenter, minCenter), maxCenter);
}

export function hideTooltip(tooltip: HTMLDivElement) {
  tooltip.style.opacity = '0';
  const state = tooltipModes.get(tooltip);
  if (state) {
    state.disconnect?.();
    hideTopLayerPopup(tooltip, state.mode);
    tooltip.hidden = true;
    if (state.original === null)
      state.slider.removeAttribute('aria-describedby');
    else state.slider.setAttribute('aria-describedby', state.original);
    tooltipModes.delete(tooltip);
    releaseTooltip(tooltip.ownerDocument, tooltip);
  }
}

export function fillSlider(
  from: HTMLInputElement,
  to: HTMLInputElement,
  controlSlider: HTMLInputElement,
) {
  const styles = getComputedStyle(controlSlider);
  const sliderColor =
    styles.getPropertyValue('--slider-color').trim() ||
    styles.getPropertyValue('--rv-ui-border').trim() ||
    'var(--rv-ui-border)';
  const rangeColor =
    styles.getPropertyValue('--range-color').trim() ||
    styles.getPropertyValue('--rv-ui-accent').trim() ||
    'var(--rv-ui-accent)';
  const rangeDistance = parseInt(to.max, 10) - parseInt(to.min, 10) || 1;
  const fromPosition = parseInt(from.value, 10) - parseInt(from.min, 10);
  const toPosition = parseInt(to.value, 10) - parseInt(to.min, 10);
  const fromPercent = (fromPosition / rangeDistance) * 100;
  const toPercent = (toPosition / rangeDistance) * 100;

  controlSlider.style.background = `linear-gradient(
        to right,
        ${sliderColor} 0%,
        ${sliderColor} ${fromPercent}%,
        ${rangeColor} ${fromPercent}%,
        ${rangeColor} ${toPercent}%,
        ${sliderColor} ${toPercent}%,
        ${sliderColor} 100%) center / 100% 4px no-repeat`;
}

export function syncVisuals(runtime: RangeSliderRuntime) {
  const { fromSlider, toSlider } = runtime.refs;
  if (!fromSlider || !toSlider) return;
  fillSlider(fromSlider, toSlider, toSlider);
  syncRangeText(runtime);
}

export function setToggleAccessible(runtime: RangeSliderRuntime) {
  if (!runtime.refs.toSlider) return;
  runtime.refs.toSlider.style.zIndex =
    Number(runtime.refs.toSlider.value) <= runtime.state.minInt ? '2' : '0';
}

export function emitRangeChange(runtime: RangeSliderRuntime) {
  runtime.onRangeChange(getCurrentRange(runtime));
}

export function emitRangeCommit(runtime: RangeSliderRuntime) {
  runtime.onRangeCommit?.(getCurrentRange(runtime));
}

export function preventInvalidNumberKey(event: KeyboardEvent) {
  if (
    event.metaKey ||
    event.ctrlKey ||
    [
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'Backspace',
      'Delete',
      'End',
      'Enter',
      'Home',
      'Tab',
    ].includes(event.key)
  ) {
    return;
  }
  if (!/^[\d.,-]$/.test(event.key)) {
    event.preventDefault();
  }
}
