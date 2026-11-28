import { Component, Input } from '@angular/core';
import { uiComponents, type UiComponentName } from './component-catalog';
import { AngularComponentAdapter } from './angular-adapter';

export { UiSlotDirective } from './angular-adapter';
export type { UiComponentSlotContexts } from './component-metadata';
export type {
  UiEvent,
  AngularInput,
  AngularCallbackValue,
} from './angular-adapter';
export type { UiComponentName, UiComponentProps } from './component-catalog';
export * from './angular-components';

/** Backward-compatible dynamic catalog host; use named components for static imports. */
@Component({
  selector: 'rv-ui',
  standalone: true,
  template: '<span #rvHost style="display: contents"></span>',
  host: { style: 'display: contents' },
})
export class UiComponent extends AngularComponentAdapter {
  @Input({ required: true }) component!: UiComponentName;
  @Input() props: Record<string, any> = {};
  protected get rvComponentName() {
    return this.component;
  }
  protected rvResolveComponent() {
    const component = uiComponents[this.component];
    if (!component) throw new Error(`Unknown UI component: ${this.component}`);
    return component;
  }
  protected rvResolveProps() {
    return this.props;
  }
}

export type { PdfViewerProps, PdfViewerText } from './pdf-viewer/component';
export type { PdfViewerToolbarProps } from './pdf-viewer/toolbar';
export type {
  PdfViewerButton,
  PdfViewerButtonOptions,
  PdfViewerToolbarOptions,
  PdfViewerToolbarConfig,
} from './pdf-viewer/toolbar-options';
export { defaultPdfViewerText } from './pdf-viewer/index';

export { createTooltipGroup, TooltipGroup } from './core/tooltip-options';
export type {
  TooltipAnchor,
  TooltipSide,
  TooltipAlign,
  TooltipReason,
  TooltipContent,
  TooltipOffset,
  TooltipOffsetContext,
  TooltipGroupOptions,
  TooltipOptions,
  TooltipControllerOptions,
  TooltipChangeDetails,
  TooltipContentContext,
  TooltipPositionOptions,
} from './core/tooltip-options';
