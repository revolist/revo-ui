import { h } from 'preact';
import { createPreactElement } from '../preact-mount';
/** Options for a native progress meter. Labels and formatting belong to the host. */
export interface NativeProgressOptions {
  label: string;
  value: number | null;
  max: number;
  className?: string;
}

/** Create an accessible native progress meter. */
export function createProgressElement(doc: Document, options: NativeProgressOptions): HTMLProgressElement {
  const max = Number.isFinite(options.max) && options.max > 0 ? options.max : 1;
  const value = typeof options.value === 'number' && Number.isFinite(options.value)
    ? Math.min(max, Math.max(0, options.value)) : undefined;
  return createPreactElement<HTMLProgressElement>(doc, h('progress', { max, value, 'aria-label': options.label, class: options.className }));
}
