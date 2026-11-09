import {
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
  ContentChildren,
  QueryList,
  ViewContainerRef,
  ChangeDetectorRef,
  inject,
  PLATFORM_ID,
  type AfterContentInit,
  type AfterViewInit,
  type OnChanges,
  type OnDestroy,
  type EmbeddedViewRef,
} from '@angular/core';
import {
  uiComponents,
  componentModels,
  createFrameworkMount,
  withFrameworkContent,
  type UiComponentName,
  type UiComponentProps,
  type UiFrameworkMount,
  type UiContentTarget,
} from './framework';

export type { UiComponentName, UiComponentProps } from './framework';
export interface UiEvent {
  name: string;
  args: unknown[];
}

/** Angular owns these views even when their nodes are moved into a Preact slot. */
@Directive({ selector: 'ng-template[rvUiSlot]', standalone: true })
export class UiSlotDirective {
  @Input() rvUiSlot = 'default';
  readonly template = inject<TemplateRef<Record<string, unknown>>>(TemplateRef);
  readonly container = inject(ViewContainerRef);
}

/** Host any shared catalog component with Angular-owned template content. */
@Component({
  selector: 'rv-ui',
  standalone: true,
  template: '<span #host style="display: contents"></span>',
  host: { style: 'display: contents' },
})
export class UiComponent
  implements AfterContentInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) component!: UiComponentName;
  @Input() props: Record<string, any> = {};
  @Output() valueChange = new EventEmitter<unknown>();
  @Output() uiEvent = new EventEmitter<UiEvent>();
  @ViewChild('host', { static: true }) private host!: ElementRef<HTMLElement>;
  @ContentChildren(UiSlotDirective) private slots!: QueryList<UiSlotDirective>;
  private readonly changes = inject(ChangeDetectorRef);
  private mount?: UiFrameworkMount<UiSlotDirective>;
  private slotSubscription?: { unsubscribe(): void };
  private views = new Map<
    number,
    {
      target: UiContentTarget<UiSlotDirective>;
      view: EmbeddedViewRef<Record<string, unknown>>;
    }
  >();
  private destroyed = false;
  private readonly browser = inject(PLATFORM_ID) === 'browser';

  ngAfterContentInit(): void {
    this.slotSubscription = this.slots.changes.subscribe(() => this.update());
  }
  ngAfterViewInit(): void {
    if (!this.browser) return;
    this.mount = createFrameworkMount(this.host.nativeElement, (targets) =>
      this.renderTemplates(targets),
    );
    this.update();
  }
  ngOnChanges(): void {
    this.update();
  }
  private update(): void {
    if (!this.mount || this.destroyed) return;
    const component = uiComponents[this.component];
    if (!component) throw new Error(`Unknown UI component: ${this.component}`);
    const props = { ...this.props };
    const model = componentModels[this.component];
    const callbacks = new Set([
      ...Object.keys(props).filter((key) => /^on[A-Z]/.test(key)),
      'onClose',
      ...(model ? [model.callback] : []),
    ]);
    for (const name of callbacks) {
      const original = props[name];
      props[name] = (...args: unknown[]) => {
        const result = original?.(...args);
        if (model?.callback === name) this.valueChange.emit(args[0]);
        this.uiEvent.emit({ name, args });
        this.changes.markForCheck();
        return result;
      };
    }
    const slots = Object.fromEntries(
      this.slots?.map((slot) => [slot.rvUiSlot, slot]) ?? [],
    );
    this.mount.render(component, props, (props, content) =>
      withFrameworkContent(this.component, props, slots, content),
    );
  }
  private renderTemplates(targets: UiContentTarget<UiSlotDirective>[]): void {
    if (this.destroyed) return;
    const live = new Set(targets.map((target) => target.id));
    for (const [id, record] of this.views) {
      if (!live.has(id)) {
        this.release(record);
        this.views.delete(id);
      }
    }
    for (const target of targets) {
      let record = this.views.get(target.id);
      if (record && record.target.content !== target.content) {
        this.release(record);
        this.views.delete(target.id);
        record = undefined;
      }
      const context = { $implicit: target.scope, ...target.scope };
      if (!record) {
        const view = target.content.container.createEmbeddedView(
          target.content.template,
          context,
        );
        record = { target, view };
        this.views.set(target.id, record);
      } else {
        record.target = target;
        for (const key of Object.keys(record.view.context))
          if (!(key in context)) delete record.view.context[key];
        Object.assign(record.view.context, context);
      }
      record.view.detectChanges();
      // Moving an already-attached node blurs focused descendants in browsers.
      for (const node of record.view.rootNodes) {
        if (node.parentNode !== target.element)
          target.element.appendChild(node);
      }
    }
  }
  private release(record: {
    target: UiContentTarget<UiSlotDirective>;
    view: EmbeddedViewRef<unknown>;
  }): void {
    const container = record.target.content.container;
    const index = container.indexOf(record.view);
    if (index >= 0) container.remove(index);
    else record.view.destroy();
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.slotSubscription?.unsubscribe();
    this.mount?.destroy();
    for (const record of this.views.values()) this.release(record);
    this.views.clear();
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
