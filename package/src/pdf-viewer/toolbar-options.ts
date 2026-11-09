import type { ButtonProps } from '../controls';
import type { PdfViewerTool, PdfZoom } from './types';

export type PdfViewerButton =
  | 'open'
  | 'first'
  | 'last'
  | 'previous'
  | 'next'
  | 'zoomOut'
  | 'zoomIn'
  | 'search'
  | 'rotate'
  | 'download'
  | 'print';
export type PdfViewerButtonOptions = Pick<
  ButtonProps,
  'disabled' | 'variant' | 'className' | 'title'
>;
export interface PdfViewerToolbarOptions {
  /** Omit for every group; an empty array hides all groups. */
  tools?: readonly PdfViewerTool[];
  /** false hides a button; options customize presentation or additionally disable it. */
  buttons?: Partial<Record<PdfViewerButton, false | PdfViewerButtonOptions>>;
  /** Show first/last page buttons, default false. */
  boundaryButtons?: boolean;
  showPageInput?: boolean;
  showPageCount?: boolean;
  showZoomSelect?: boolean;
  /** Valid scales from .25 to 5 and/or page-fit/page-width. Current zoom remains selectable. */
  zoomLevels?: readonly PdfZoom[];
  /** Scale multiplier greater than 1, default 1.25. */
  zoomStep?: number;
  className?: string;
}
export type PdfViewerToolbarConfig =
  | false
  | readonly PdfViewerTool[]
  | PdfViewerToolbarOptions;
export function pdfToolbarOptions(
  config?: PdfViewerToolbarConfig,
): PdfViewerToolbarOptions {
  if (config === false) return { tools: [] };
  return Array.isArray(config)
    ? { tools: config }
    : ((config as PdfViewerToolbarOptions | undefined) ?? {});
}
export function hasPdfTool(
  config: PdfViewerToolbarConfig | undefined,
  tool: PdfViewerTool,
) {
  const options = pdfToolbarOptions(config);
  if (
    tool === 'navigation' &&
    (!options.boundaryButtons ||
      (options.buttons?.first === false && options.buttons?.last === false)) &&
    options.buttons?.previous === false &&
    options.buttons?.next === false &&
    options.showPageInput === false &&
    options.showPageCount === false
  )
    return false;
  if (
    tool === 'zoom' &&
    options.buttons?.zoomOut === false &&
    options.buttons?.zoomIn === false &&
    options.showZoomSelect === false
  )
    return false;
  return (
    (!options.tools || options.tools.includes(tool)) &&
    (!['open', 'search', 'rotate', 'download', 'print'].includes(tool) ||
      options.buttons?.[tool as PdfViewerButton] !== false)
  );
}
