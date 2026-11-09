import type { Component } from 'svelte';
import InternalComponent from './svelte/UiComponent.svelte';
import type { SvelteUiProps } from './svelte-props';
export const UiComponent: Component<SvelteUiProps> = InternalComponent;
export type { SvelteUiProps } from './svelte-props';
export type { UiComponentName, UiComponentProps } from './component-catalog';

export type { PdfViewerProps, PdfViewerText } from './pdf-viewer/component';
export type { PdfViewerToolbarProps } from './pdf-viewer/toolbar';
export type {
  PdfViewerButton,
  PdfViewerButtonOptions,
  PdfViewerToolbarOptions,
  PdfViewerToolbarConfig,
} from './pdf-viewer/toolbar-options';
export { defaultPdfViewerText } from './pdf-viewer/translations';
