/** Options for a native progress meter. Labels and formatting belong to the host. */
export interface NativeProgressOptions {
  label: string;
  value: number | null;
  max: number;
  className?: string;
}

/** Create an accessible native progress meter. */
export function createProgressElement(doc: Document, options: NativeProgressOptions): HTMLProgressElement {
  const element = doc.createElement('progress');
  element.max = Number.isFinite(options.max) && options.max > 0 ? options.max : 1;
  if (typeof options.value === 'number' && Number.isFinite(options.value)) {
    element.value = Math.min(element.max, Math.max(0, options.value));
  }
  element.setAttribute('aria-label', options.label);
  if (options.className) element.className = options.className;
  return element;
}
