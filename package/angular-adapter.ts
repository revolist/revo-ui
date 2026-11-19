import {
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
  type AfterContentChecked,
  type AfterViewInit,
  type OnChanges,
  type OnDestroy,
  type EmbeddedViewRef,
  type SimpleChanges,
} from "@angular/core";
import type { ComponentType } from "preact";
import type { UiComponentName, UiComponentProps } from "./component-catalog";
import { componentModels } from "./component-metadata";
import {
  createFrameworkMount,
  withFrameworkContent,
  type UiFrameworkMount,
  type UiContentTarget,
} from "./framework-mount";

export interface UiEvent {
  name: string;
  args: unknown[];
}

/** Distribute union props so named components retain every public alternative. */
export type AngularInput<K extends UiComponentName, P extends PropertyKey> =
  UiComponentProps<K> extends infer Props
    ? Props extends unknown
      ? P extends keyof Props
        ? Props[P]
        : never
      : never
    : never;
export type AngularCallbackValue<T> =
  NonNullable<T> extends (...args: infer A) => unknown ? A[0] : never;

/** Angular owns these views even when their nodes are moved into a Preact slot. */
@Directive({ selector: "ng-template[rvUiSlot]", standalone: true })
export class UiSlotDirective {
  @Input() rvUiSlot = "default";
  readonly template = inject<TemplateRef<Record<string, unknown>>>(TemplateRef);
  readonly container = inject(ViewContainerRef);
}

interface AngularProjectedContent {
  readonly element: HTMLElement;
}
type AngularContent = UiSlotDirective | AngularProjectedContent;

/** Host any shared catalog component with Angular-owned template content. */
@Directive()
export abstract class AngularComponentAdapter<ModelValue = unknown>
  implements
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    OnChanges,
    OnDestroy
{
  protected abstract readonly rvComponentName: string;
  protected abstract rvResolveComponent(): ComponentType<any>;
  protected abstract rvResolveProps(): Record<string, any>;
  protected readonly rvRequiredCallbacks: readonly string[] = [];
  protected readonly rvInputValues: Record<string, unknown> = {};
  private readonly rvOutputs = new Map<string, EventEmitter<any>>();
  protected rvOutput<T>(callback: string): EventEmitter<T> {
    let output = this.rvOutputs.get(callback);
    if (!output) {
      output = new EventEmitter<T>();
      this.rvOutputs.set(callback, output);
    }
    return output;
  }
  protected rvCallbackOutputs(): Record<string, EventEmitter<any>> {
    return Object.fromEntries(
      [...this.rvOutputs].filter(([, output]) => output.observed),
    );
  }
  @Output() valueChange = new EventEmitter<ModelValue>();
  @Output() uiEvent = new EventEmitter<UiEvent>();
  @ViewChild("rvHost", { static: true })
  private rvHost!: ElementRef<HTMLElement>;
  @ContentChildren(UiSlotDirective)
  private rvSlots!: QueryList<UiSlotDirective>;
  private readonly rvChanges = inject(ChangeDetectorRef);
  @ViewChild("rvProjected", { static: true })
  private rvProjected?: ElementRef<HTMLElement>;
  private rvProjection?: AngularProjectedContent;
  private rvProjectionPresent = false;
  private rvMount?: UiFrameworkMount<AngularContent>;
  private rvSlotSubscription?: { unsubscribe(): void };
  private rvViews = new Map<
    number,
    {
      target: UiContentTarget<UiSlotDirective>;
      view: EmbeddedViewRef<Record<string, unknown>>;
    }
  >();
  private rvDestroyed = false;
  private readonly rvBrowser = inject(PLATFORM_ID) === "browser";

  /** Adapter host available after view creation; cleared when its owner is destroyed. */
  getElement(): HTMLElement | null {
    return this.rvDestroyed || !this.rvMount ? null : this.rvHost.nativeElement;
  }

  ngAfterContentInit(): void {
    this.rvSlotSubscription = this.rvSlots.changes.subscribe(() =>
      this.rvUpdate(),
    );
  }
  ngAfterContentChecked(): void {
    const present = this.rvHasProjection();
    if (present !== this.rvProjectionPresent) {
      this.rvProjectionPresent = present;
      this.rvUpdate();
    }
  }
  private rvHasProjection(): boolean {
    const projected = this.rvProjected?.nativeElement;
    return (
      !!projected &&
      [...projected.childNodes].some(
        (node) => node.nodeType === 1 || node.nodeType === 3,
      )
    );
  }
  ngAfterViewInit(): void {
    if (!this.rvBrowser) return;
    this.rvMount = createFrameworkMount<AngularContent>(
      this.rvHost.nativeElement,
      (targets) => this.rvRenderTemplates(targets),
    );
    this.rvUpdate();
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (const [name, change] of Object.entries(changes)) {
      const pickerValue =
        name === "value" &&
        (this.rvComponentName === "DatePicker" ||
          this.rvComponentName === "DateRangePicker");
      if (change.currentValue === undefined && !pickerValue)
        delete this.rvInputValues[name];
      else this.rvInputValues[name] = change.currentValue;
    }
    this.rvUpdate();
  }
  private rvUpdate(): void {
    if (!this.rvMount || this.rvDestroyed) return;
    const component = this.rvResolveComponent();
    const props = { ...this.rvResolveProps() };
    const model = componentModels[this.rvComponentName as UiComponentName];
    const outputs = this.rvCallbackOutputs();
    const callbacks = new Set([
      ...Object.keys(props).filter((key) => /^on[A-Z]/.test(key)),
      "onClose",
      ...(model ? [model.callback] : []),
      ...Object.keys(outputs),
      ...this.rvRequiredCallbacks,
    ]);
    for (const name of callbacks) {
      const original = props[name];
      props[name] = (...args: unknown[]) => {
        const result = original?.(...args);
        if (model?.callback === name)
          this.valueChange.emit(args[0] as ModelValue);
        outputs[name]?.emit(args[0]);
        this.uiEvent.emit({ name, args });
        this.rvChanges.markForCheck();
        return result;
      };
    }
    const rvSlots: Record<string, AngularContent> = Object.fromEntries(
      this.rvSlots?.map((slot) => [slot.rvUiSlot, slot]) ?? [],
    );
    const projected = this.rvProjected?.nativeElement;
    const useProjection =
      !rvSlots.default && projected && this.rvHasProjection();
    if (projected && !useProjection) projected.style.display = "none";
    if (useProjection) {
      this.rvProjection ??= { element: projected };
      rvSlots.default = this.rvProjection;
    }
    this.rvMount.render(component, props, (props, content) =>
      withFrameworkContent(this.rvComponentName, props, rvSlots, content),
    );
  }
  private rvRenderTemplates(targets: UiContentTarget<AngularContent>[]): void {
    if (this.rvDestroyed) return;
    const live = new Set(targets.map((target) => target.id));
    for (const [id, record] of this.rvViews) {
      if (!live.has(id)) {
        this.rvRelease(record);
        this.rvViews.delete(id);
      }
    }
    for (const entry of targets) {
      if ("element" in entry.content) {
        entry.content.element.style.display = "contents";
        if (entry.content.element.parentNode !== entry.element)
          entry.element.appendChild(entry.content.element);
        continue;
      }
      const target = { ...entry, content: entry.content };
      let record = this.rvViews.get(target.id);
      if (record && record.target.content !== target.content) {
        this.rvRelease(record);
        this.rvViews.delete(target.id);
        record = undefined;
      }
      const context = { $implicit: target.scope, ...target.scope };
      if (!record) {
        const view = target.content.container.createEmbeddedView(
          target.content.template,
          context,
        );
        record = { target, view };
        this.rvViews.set(target.id, record);
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
  private rvRelease(record: {
    target: UiContentTarget<UiSlotDirective>;
    view: EmbeddedViewRef<unknown>;
  }): void {
    const container = record.target.content.container;
    const index = container.indexOf(record.view);
    if (index >= 0) container.remove(index);
    else record.view.destroy();
  }
  ngOnDestroy(): void {
    this.rvDestroyed = true;
    this.rvSlotSubscription?.unsubscribe();
    this.rvMount?.destroy();
    for (const record of this.rvViews.values()) this.rvRelease(record);
    this.rvViews.clear();
  }
}
