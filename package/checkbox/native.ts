import { h } from 'preact';
import { createPreactElement } from '../preact-mount';
import { renderCheckbox, type SharedCheckboxAttributes } from './index';

/** Render the shared checkbox for hosts that work with native elements. */
export function createCheckboxElement(
  document: Document,
  attributes: SharedCheckboxAttributes = {},
): HTMLInputElement {
  return createPreactElement<HTMLInputElement>(document, renderCheckbox(h, attributes));
}
