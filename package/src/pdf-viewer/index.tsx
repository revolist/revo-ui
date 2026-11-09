import { h } from 'preact';
import { renderPreactInto } from '../preact-mount';
import { PdfViewerView, type PdfViewerProps } from './component';
import { PdfViewerController } from './controller';
export {
  PdfViewer,
  defaultPdfViewerText,
  type PdfViewerProps,
  type PdfViewerText,
} from './component';
export { PdfViewerController } from './controller';
export type * from './types';

/** Mount the shared viewer in a native host. Call destroy to unmount and release PDF resources. */
export function createPdfViewer(
  host: HTMLElement,
  options: PdfViewerProps,
): PdfViewerController {
  const controller = new PdfViewerController(options);
  const destroy = controller.destroy.bind(controller);
  let destroyed = false;
  controller.destroy = () => {
    if (destroyed) return;
    destroyed = true;
    destroy();
    renderPreactInto(host, null);
  };
  renderPreactInto(host, h(PdfViewerView, { ...options, controller }));
  return controller;
}

export { PdfViewerToolbar, type PdfViewerToolbarProps } from './toolbar';
export type {
  PdfViewerButton,
  PdfViewerButtonOptions,
  PdfViewerToolbarOptions,
  PdfViewerToolbarConfig,
} from './toolbar-options';
