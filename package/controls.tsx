import type { ClassPreset } from './presets/types';
import { useTitleTooltip } from './core/title-tooltip';
import { animateNumberStep } from './number-stepper-motion';
import type { MotionPreset } from './presets/motion';
import { RatingStar } from './rating-choice';
import { Input, TextArea, ButtonControl } from './native-control';
import { registerControl } from './control-presentation';
import { paginationItems, renderPaginationButton } from './pagination';
import { paginationIcons } from './icons/pagination';
import { renderLoadingIndicator } from './native-controls';
import { forwardRef } from 'preact/compat';
import { createControlId } from './core/control-id';
import { h, Fragment, type ComponentChildren, type JSX } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { SvgIcon } from './icons/icon';
import { SvgButton } from './buttons/svg-button';
import {
  SegmentedSwitch,
  type SegmentedSwitchProps,
  type SegmentedSwitchValue,
} from './segmented-switch';
import { EditorPane, EditorSplitLayout } from './editor-layout';
import {
  attachMenuKeyboard,
  attachResizeHandle,
  type ResizeOptions,
} from './surfaces';
import { normalizeProgressRange } from './progress/range';

type ButtonAttributes = Omit<JSX.IntrinsicElements['button'], 'className'>;
export type ButtonPreset = {
  className?: string;
  props?: {
    variant?:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'danger'
      | 'danger-outline'
      | 'ghost'
      | 'link'
      | 'solid';
    size?: 'compact' | 'default' | 'large';
    rounded?: boolean;
  };
};

export type ButtonProps = ButtonAttributes & {
  preset?: ButtonPreset;
  /** Pill-shaped corners for any button variant. */
  rounded?: boolean;
  /** Render navigation with native anchor semantics. */
  href?: string;
  target?: JSX.IntrinsicElements['a']['target'];
  rel?: string;
  /** Show progress and block activation until cleared, preserving variant colors. */
  busy?: boolean;
  className?: string;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'danger-outline'
    | 'ghost'
    | 'link'
    | 'solid';
  size?: 'compact' | 'default' | 'large';
};
export const Button = /* @__PURE__ */ registerControl(
  /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
      href,
      target,
      rel,
      preset,
      rounded: roundedProp,
      variant: variantProp,
      size: sizeProp,
      className = '',
      class: nativeClass,
      ...props
    }: ButtonProps,
    ref,
  ) {
    const rounded = roundedProp ?? preset?.props?.rounded ?? false;
    const variant = variantProp ?? preset?.props?.variant ?? 'default';
    const size = sizeProp ?? preset?.props?.size ?? 'default';
    const linkTooltip = useTitleTooltip<HTMLAnchorElement>(
      href !== undefined && typeof props.title === 'string'
        ? props.title
        : undefined,
    );
    const classes = [
      'rv-style-action',
      variant === 'default' ? 'rv-btn' : `rv-btn-${variant}`,
      size === 'compact' ? 'rv-btn-sm' : size === 'large' ? 'rv-btn-lg' : '',
      rounded ? 'rv-btn-rounded' : '',
      nativeClass,
      preset?.className,
      className,
    ]
      .filter(Boolean)
      .join(' ');
    if (href !== undefined) {
      const blocked = props.disabled || props.busy;
      const { busy, disabled, title, ...linkProps } = props;
      return (
        <a
          {...(linkProps as any)}
          ref={linkTooltip}
          href={blocked ? undefined : href}
          target={target}
          rel={rel}
          class={classes}
          aria-disabled={blocked || undefined}
          aria-busy={busy || undefined}
          tabIndex={blocked ? -1 : props.tabIndex}
          onClick={(event) => {
            if (blocked) {
              event.preventDefault();
              return;
            }
            (props.onClick as any)?.(event);
          }}
        />
      );
    }
    return (
      <ButtonControl
        ref={ref}
        rounded={rounded}
        type="button"
        {...props}
        class={[
          'rv-style-action',
          variant === 'default' ? 'rv-btn' : `rv-btn-${variant}`,
          size === 'compact'
            ? 'rv-btn-sm'
            : size === 'large'
              ? 'rv-btn-lg'
              : '',
          nativeClass,
          preset?.className,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }),
  'button',
);
/** Preact convenience composition of the shared SVG command button owner. */
export function IconButton({
  label,
  icon,
  badge,
  children,
  className = '',
  preset,
  variant: variantProp,
  size: sizeProp,
  rounded,
  ...props
}: ButtonProps & { label: string; icon?: string; badge?: string | number }) {
  const variant = variantProp ?? preset?.props?.variant ?? 'ghost';
  const size = sizeProp ?? preset?.props?.size ?? 'default';
  return (
    <SvgButton
      {...props}
      label={label}
      icon={icon}
      badge={badge}
      className={`rv-btn-icon rv-style-action ${variant === 'default' ? 'rv-btn' : `rv-btn-${variant}`} ${size === 'compact' ? 'rv-btn-sm' : size === 'large' ? 'rv-btn-lg' : ''} ${(rounded ?? preset?.props?.rounded) ? 'rv-btn-rounded' : ''} ${preset?.className ?? ''} ${className}`}
    >
      {children}
    </SvgButton>
  );
}
export function ToggleButton({
  pressed,
  onPressedChange,
  ...props
}: ButtonProps & {
  pressed: boolean;
  onPressedChange: (value: boolean) => void;
}) {
  return (
    <Button
      {...props}
      aria-pressed={pressed}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) onPressedChange(!pressed);
      }}
    />
  );
}
type ShellProps = {
  children?: ComponentChildren;
  className?: string;
  label?: string;
  preset?: ClassPreset;
};
export function ButtonGroup({
  children,
  className = '',
  label,
  preset,
}: ShellProps) {
  return (
    <div
      role="group"
      aria-label={label}
      class={`rv-btn-group ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      {children}
    </div>
  );
}
export function SegmentedControl<T extends SegmentedSwitchValue>(
  props: SegmentedSwitchProps<T>,
) {
  return <SegmentedSwitch {...props} role="radiogroup" />;
}
export function Tabs<T extends SegmentedSwitchValue>(
  props: SegmentedSwitchProps<T>,
) {
  return <SegmentedSwitch {...props} role="tablist" />;
}
export function TabPanel({
  preset,
  className = '',
  id,
  labelledBy,
  active,
  children,
}: {
  preset?: ClassPreset;
  className?: string;
  id: string;
  labelledBy: string;
  active: boolean;
  children?: ComponentChildren;
}) {
  return (
    <div
      id={id}
      class={`${preset?.className ?? ''} ${className}`.trim()}
      data-part="root"
      role="tabpanel"
      aria-labelledby={labelledBy}
      hidden={!active}
    >
      {children}
    </div>
  );
}

export interface RadioOption<T extends string | number> {
  value: T;
  label: ComponentChildren;
  disabled?: boolean;
}
export type RadioGroupPreset = {
  className?: string;
  props?: { disabled?: boolean };
};

export function RadioGroup<T extends string | number>({
  preset,
  className = '',
  value,
  options,
  onChange,
  label,
  disabled,
  name,
}: {
  preset?: RadioGroupPreset;
  value: T;
  options: readonly RadioOption<T>[];
  className?: string;
  onChange: (value: T) => void;
  label: string;
  disabled?: boolean;
  name?: string;
}) {
  const [id] = useState(() => createControlId('rv-ui'));
  return (
    <fieldset
      class={`rv-radio-group ${preset?.className ?? ''} ${className}`}
      disabled={disabled ?? preset?.props?.disabled}
      data-part="root"
    >
      <legend data-part="label">{label}</legend>
      {options.map((option) => (
        <label key={option.value} data-part="option">
          <Input
            type="radio"
            data-part="input"
            name={name ?? id}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

export type TextFieldPreset = {
  className?: string;
  props?: { disabled?: boolean; readOnly?: boolean };
};

export type TextInputProps = Omit<
  JSX.IntrinsicElements['input'],
  'className'
> & {
  preset?: TextFieldPreset;
  className?: string;
  onValueChange?: (value: string) => void;
};
export function TextInput({
  preset,
  className = '',
  class: nativeClass,
  onValueChange,
  onInput,
  ...props
}: TextInputProps) {
  return (
    <Input
      type="text"
      {...preset?.props}
      {...props}
      data-part="input"
      data-preset-scope="root"
      class={`rv-control ${nativeClass ?? ''} ${preset?.className ?? ''} ${className}`}
      onInput={(event) => {
        onInput?.(event);
        if (!event.defaultPrevented) onValueChange?.(event.currentTarget.value);
      }}
    />
  );
}
export function Textarea({
  preset,
  className = '',
  class: nativeClass,
  onValueChange,
  onInput,
  ...props
}: Omit<JSX.IntrinsicElements['textarea'], 'className'> & {
  preset?: TextFieldPreset;
  className?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <TextArea
      {...preset?.props}
      {...props}
      data-part="input"
      data-preset-scope="root"
      class={`rv-control ${nativeClass ?? ''} ${preset?.className ?? ''} ${className}`}
      onInput={(event) => {
        onInput?.(event);
        if (!event.defaultPrevented) onValueChange?.(event.currentTarget.value);
      }}
    />
  );
}
export function NumberInput({
  onValueChange,
  ...props
}: Omit<TextInputProps, 'type' | 'onValueChange'> & {
  onValueChange?: (value: number | undefined) => void;
}) {
  return (
    <TextInput
      {...props}
      type="number"
      onValueChange={(text) => {
        if (text === '') onValueChange?.(undefined);
        else if (Number.isFinite(Number(text))) onValueChange?.(Number(text));
      }}
    />
  );
}
export type NumberStepperPreset = {
  motion?: MotionPreset;
  className?: string;
  props?: { step?: number; disabled?: boolean; readOnly?: boolean };
};

export function NumberStepper({
  preset,
  className = '',
  value,
  min = -Infinity,
  max = Infinity,
  step: stepProp,
  onChange,
  label,
  decreaseLabel,
  increaseLabel,
  disabled: disabledProp,
  readOnly: readOnlyProp,
}: {
  preset?: NumberStepperPreset;
  className?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  label: string;
  decreaseLabel: string;
  increaseLabel: string;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const step = stepProp ?? preset?.props?.step ?? 1;
  const disabled = disabledProp ?? preset?.props?.disabled;
  const readOnly = readOnlyProp ?? preset?.props?.readOnly;
  const root = useRef<HTMLDivElement>(null);
  const pendingStep = useRef<{ from: number; to: number }>();
  useLayoutEffect(() => {
    const pending = pendingStep.current;
    pendingStep.current = undefined;
    if (pending && pending.to === value && root.current)
      return animateNumberStep(
        root.current,
        pending.from,
        value,
        preset?.motion,
      );
  }, [value, preset?.motion]);
  const set = (next: number) => {
    if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next)));
  };
  const changeStep = (next: number) => {
    const target = Math.max(min, Math.min(max, next));
    if (Number.isFinite(target) && target !== value)
      pendingStep.current = { from: value, to: target };
    set(next);
  };
  return (
    <div
      ref={root}
      class={`rv-number-stepper ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="group"
      aria-label={label}
    >
      <Button
        data-part="decrease"
        disabled={disabled || readOnly || value <= min}
        aria-label={decreaseLabel}
        onClick={() => changeStep(value - step)}
      >
        −
      </Button>
      <NumberInput
        aria-label={label}
        value={value}
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(max) ? max : undefined}
        step={step}
        disabled={disabled}
        readOnly={readOnly}
        onValueChange={(next) => {
          pendingStep.current = undefined;
          if (next !== undefined) set(next);
        }}
      />
      <Button
        data-part="increase"
        disabled={disabled || readOnly || value >= max}
        aria-label={increaseLabel}
        onClick={() => changeStep(value + step)}
      >
        +
      </Button>
    </div>
  );
}
export function Chip({ children, className = '', preset }: ShellProps) {
  return (
    <span
      class={`rv-btn-pill ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      {children}
    </span>
  );
}
export function FieldHint({
  children,
  id,
  className = '',
  preset,
}: ShellProps & { id?: string }) {
  return (
    <span
      class={`rv-field__hint ${preset?.className ?? ''} ${className}`}
      data-part="root"
      id={id}
    >
      {children}
    </span>
  );
}
export function FieldError({
  children,
  id,
  className = '',
  preset,
}: ShellProps & { id?: string }) {
  return (
    <span
      class={`rv-field__error ${preset?.className ?? ''} ${className}`}
      data-part="root"
      id={id}
      role="alert"
    >
      {children}
    </span>
  );
}
export function FormSection({
  children,
  preset,
  className = '',
  title,
  description,
}: ShellProps & { title?: string; description?: string }) {
  return (
    <fieldset
      class={`rv-form-section ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      {title && (
        <legend class="rv-form-section__title" data-part="title">
          {title}
        </legend>
      )}
      {description && (
        <p class="rv-form-description" data-part="description">
          {description}
        </p>
      )}
      {children}
    </fieldset>
  );
}
export function Disclosure({
  children,
  preset,
  className = '',
  summary,
  open,
  onToggle,
}: ShellProps & {
  summary: ComponentChildren;
  open?: boolean;
  onToggle?: JSX.GenericEventHandler<HTMLDetailsElement>;
}) {
  return (
    <details
      class={`rv-disclosure ${preset?.className ?? ''} ${className}`.trim()}
      data-part="root"
      open={open}
      onToggle={onToggle}
    >
      <summary class="rv-disclosure-summary" data-part="summary">
        {summary}
      </summary>
      {children}
    </details>
  );
}
export { EditorPane as Pane, EditorSplitLayout as SplitLayout };
export function Panel({
  children,
  className = '',
  label,
  preset,
}: ShellProps & { preset?: ClassPreset }) {
  return (
    <section
      class={`rv-panel ${preset?.className ?? ''} ${className}`}
      data-part="root"
      aria-label={label}
    >
      {children}
    </section>
  );
}

export function Toolbar({
  children,
  className = '',
  label,
  preset,
}: ShellProps & { preset?: ClassPreset }) {
  return (
    <div
      class={`rv-toolbar ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="toolbar"
      aria-label={label}
    >
      {children}
    </div>
  );
}
export function ToolbarGroup({
  children,
  className = '',
  label,
  preset,
}: ShellProps & { preset?: ClassPreset }) {
  return (
    <div
      class={`rv-toolbar-group ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}
export function ToolbarSeparator({
  preset,
  className = '',
}: { preset?: ClassPreset; className?: string } = {}) {
  return (
    <span
      class={`rv-toolbar-separator ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="separator"
      aria-orientation="vertical"
    />
  );
}
export { Badge } from './badge.view';
export function CountBadge({
  count,
  label,
  preset,
  className = '',
}: {
  count: number;
  label: string;
  preset?: ClassPreset;
  className?: string;
}) {
  return (
    <span
      class={`rv-count ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="img"
      aria-label={label}
    >
      {count}
    </span>
  );
}
export { Alert } from './alert';
export function Spinner({
  label,
  preset,
  className = '',
}: {
  label: string;
  preset?: ClassPreset;
  className?: string;
}) {
  return renderLoadingIndicator(h, {
    label,
    className: `rv-spinner ${preset?.className ?? ''} ${className}`,
    showSpinner: true,
  });
}
export function LoadingOverlay({
  preset,
  className = '',
  busy,
  label,
  children,
}: {
  busy: boolean;
  label: string;
  children?: ComponentChildren;
  preset?: ClassPreset;
  className?: string;
}) {
  return (
    <div
      class={`rv-loading-container ${preset?.className ?? ''} ${className}`}
      data-part="root"
      aria-busy={busy}
    >
      {children}
      {busy && (
        <div class="rv-loading-overlay" data-part="overlay">
          <Spinner label={label} />
        </div>
      )}
    </div>
  );
}
export function EmptyState({
  preset,
  className = '',
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ComponentChildren;
  preset?: ClassPreset;
  className?: string;
}) {
  return (
    <div
      class={`rv-empty-state ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      <strong data-part="title">{title}</strong>
      {description && <p data-part="description">{description}</p>}
      {children}
    </div>
  );
}

export function Menu({
  children,
  label,
  className = '',
  preset,
  onClose,
}: ShellProps & { preset?: ClassPreset; onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () => (ref.current ? attachMenuKeyboard(ref.current, onClose) : undefined),
    [onClose],
  );
  return (
    <div
      ref={ref}
      class={`rv-menu ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="menu"
      aria-label={label}
    >
      {children}
    </div>
  );
}
export function MenuItem({ children, ...props }: ButtonProps) {
  return (
    <Button
      variant={props.variant ?? props.preset?.props?.variant ?? 'ghost'}
      {...props}
      role="menuitem"
    >
      {children}
    </Button>
  );
}
export function MenuSeparator({
  preset,
  className = '',
}: { preset?: ClassPreset; className?: string } = {}) {
  return (
    <div
      role="separator"
      data-part="root"
      class={`rv-menu-separator ${preset?.className ?? ''} ${className}`}
    />
  );
}
export function Submenu({
  label,
  children,
  preset,
  className = '',
}: ShellProps & { label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [id] = useState(() => createControlId('rv-ui'));
  useLayoutEffect(() => {
    if (open)
      ref.current
        ?.querySelector('[role="menu"]')
        ?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')
        ?.focus();
  }, [open]);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <div
      ref={ref}
      class={`rv-submenu ${preset?.className ?? ''} ${className}`}
      data-part="root"
      onKeyDown={(event) => {
        if (open && (event.key === 'ArrowLeft' || event.key === 'Escape')) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <Button
        ref={trigger}
        variant="ghost"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        {label}
      </Button>
      {open && (
        <div id={id}>
          <Menu label={label} onClose={close}>
            {children}
          </Menu>
        </div>
      )}
    </div>
  );
}
export function ResizeHandle(
  props: ResizeOptions & { preset?: ClassPreset; className?: string },
) {
  const ref = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  latest.current = props;
  useLayoutEffect(
    () =>
      ref.current
        ? attachResizeHandle(ref.current, () => latest.current)
        : undefined,
    [],
  );
  return (
    <div
      class={`rv-resize-handle ${props.preset?.className ?? ''} ${props.className ?? ''}`}
      data-part="root"
      ref={ref}
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={props.label}
      aria-valuenow={props.value}
      aria-valuemin={props.min}
      aria-valuemax={props.max}
    />
  );
}

export interface PanelResizeHandleProps extends Omit<
  ResizeOptions,
  'value' | 'direction'
> {
  edge: 'left' | 'right';
  initialWidth: number;
  anchorRef?: { current: HTMLDivElement | null };
  /** Measure the outer host when it owns the resized width. */
  resizeParent?: boolean;
}

/** Measures the containing panel and places a width control on its physical edge. */
export function PanelResizeHandle({
  edge,
  initialWidth,
  anchorRef,
  resizeParent = false,
  max,
  ...props
}: PanelResizeHandleProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = anchorRef ?? localRef;
  const [width, setWidth] = useState(initialWidth);
  useLayoutEffect(() => {
    const container = ref.current?.parentElement;
    const panel = resizeParent ? container?.parentElement : container;
    if (!panel) return;
    const measure = () => {
      const size = Math.round(panel.getBoundingClientRect().width);
      if (size > 0) setWidth(size);
    };
    measure();
    const Observer = panel.ownerDocument.defaultView?.ResizeObserver;
    const observer = Observer && new Observer(measure);
    observer?.observe(panel, { box: 'border-box' });
    return () => observer?.disconnect();
  }, [ref, resizeParent]);

  return (
    <div ref={ref} class="rv-panel-resize-handle" data-edge={edge}>
      <ResizeHandle
        {...props}
        value={width}
        max={max === undefined ? undefined : Math.max(max, width)}
        direction={edge === 'left' ? 'rtl' : 'ltr'}
      />
    </div>
  );
}

export type PaginationDirection = 'first' | 'previous' | 'next' | 'last';
export type PaginationButtonOptions = Pick<
  ButtonProps,
  'disabled' | 'variant' | 'className' | 'title'
>;
export type PaginationPreset = ClassPreset & {
  props?: {
    variant?: 'compact' | 'numbered' | 'icons';
    disabled?: boolean;
    navigation?: boolean;
    boundaryButtons?: boolean;
  };
};
export interface PaginationProps {
  preset?: PaginationPreset;
  /** Zero-based page index. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  label: string;
  previousLabel: string;
  nextLabel: string;
  firstLabel?: string;
  lastLabel?: string;
  variant?: 'compact' | 'numbered' | 'icons';
  disabled?: boolean;
  navigation?: boolean;
  /** Show first/last buttons, default false. */
  boundaryButtons?: boolean;
  buttons?: Partial<
    Record<PaginationDirection, false | PaginationButtonOptions>
  >;
  /** Optional page field/selector between the previous and next controls. */
  children?: ComponentChildren;
  className?: string;
}
export function Pagination({
  preset,
  page,
  pageCount,
  onChange,
  label,
  previousLabel,
  nextLabel,
  firstLabel = 'First page',
  lastLabel = 'Last page',
  variant: variantProp,
  disabled: disabledProp,
  navigation: navigationProp,
  boundaryButtons: boundaryButtonsProp,
  buttons,
  children,
  className = '',
}: PaginationProps) {
  const variant = variantProp ?? preset?.props?.variant ?? 'compact';
  const disabled = disabledProp ?? preset?.props?.disabled ?? false;
  const navigation = navigationProp ?? preset?.props?.navigation ?? true;
  const boundaryButtons =
    boundaryButtonsProp ?? preset?.props?.boundaryButtons ?? false;
  const count = Number.isFinite(pageCount)
    ? Math.max(0, Math.floor(pageCount))
    : 0;
  const current = Math.min(
    Math.max(0, Math.floor(page) || 0),
    Math.max(0, count - 1),
  );
  const button = (kind: PaginationDirection, text: string) => {
    const options = buttons?.[kind];
    if (options === false) return null;
    const target =
      kind === 'first'
        ? 0
        : kind === 'last'
          ? count - 1
          : current + (kind === 'previous' ? -1 : 1);
    const unavailable =
      disabled ||
      !!options?.disabled ||
      !count ||
      target < 0 ||
      target >= count ||
      target === current;
    return (
      <IconButton
        {...options}
        label={text}
        icon={paginationIcons[kind]}
        size="compact"
        className={`rv-pagination-button rv-pagination-button--icon ${options?.className ?? ''}`}
        disabled={unavailable}
        onClick={() => {
          if (!unavailable) onChange(target);
        }}
      />
    );
  };
  return (
    <nav
      class={`rv-pagination ${variant === 'numbered' ? 'rv-pagination--numbered' : ''} ${preset?.className ?? ''} ${className}`}
      data-part="root"
      aria-label={label}
    >
      {navigation && boundaryButtons && button('first', firstLabel)}
      {navigation && button('previous', previousLabel)}
      {children}
      {variant === 'numbered' ? (
        <>
          <span
            class={`rv-pagination-pages ${count <= 5 ? 'rv-pagination-pages--compact' : ''}`}
          >
            {paginationItems(current, count, 3).map((item, index) =>
              item === 'ellipsis' ? (
                <span
                  key={`gap-${index}`}
                  class="rv-pagination-ellipsis"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                renderPaginationButton(h, {
                  text: String(item + 1),
                  label: `${item + 1}`,
                  active: item === current,
                  disabled,
                  onClick: () => {
                    if (!disabled && item !== current) onChange(item);
                  },
                })
              ),
            )}
          </span>
          {count > 5 && (
            <span
              class="rv-pagination-summary rv-pagination-summary--responsive"
              aria-live="polite"
            >
              {count ? current + 1 : 0} / {count}
            </span>
          )}
        </>
      ) : variant === 'compact' ? (
        <span class="rv-pagination-summary" aria-live="polite">
          {count ? current + 1 : 0} / {count}
        </span>
      ) : null}
      {navigation && button('next', nextLabel)}
      {navigation && boundaryButtons && button('last', lastLabel)}
    </nav>
  );
}
export function CircularProgress({
  preset,
  className = '',
  value,
  min = 0,
  max = 100,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  label: string;
  preset?: ClassPreset;
  className?: string;
}) {
  const normalized = normalizeProgressRange(value, min, max);
  return (
    <svg
      viewBox="0 0 36 36"
      class={`rv-circular-progress ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="progressbar"
      aria-label={label}
      aria-valuemin={normalized.min}
      aria-valuemax={normalized.max}
      aria-valuenow={
        normalized.min +
        ((normalized.max - normalized.min) * normalized.percent) / 100
      }
    >
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="currentColor"
        opacity="0.15"
        data-part="track"
      />
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="currentColor"
        pathLength="100"
        data-part="fill"
        stroke-dasharray={`${normalized.percent} 100`}
        transform="rotate(-90 18 18)"
      />
    </svg>
  );
}
export type RatingPreset = ClassPreset & {
  props?: { max?: number; disabled?: boolean };
};
export function Rating({
  preset,
  className = '',
  value,
  max: maxProp,
  label,
  onChange,
  disabled: disabledProp,
}: {
  value: number;
  max?: number;
  label: string;
  onChange?: (value: number) => void;
  disabled?: boolean;
  preset?: RatingPreset;
  className?: string;
}) {
  const max = maxProp ?? preset?.props?.max ?? 5;
  const disabled = disabledProp ?? preset?.props?.disabled;
  const options = Array.from(
    { length: Math.max(0, Math.min(100, Math.floor(max))) },
    (_, index) => index + 1,
  );
  return onChange ? (
    <RadioGroup
      className={`rv-rating ${preset?.className ?? ''} ${className}`}
      label={label}
      value={value}
      disabled={disabled}
      options={options.map((option) => ({
        value: option,
        label: (
          <>
            <RatingStar filled={option <= value} />
            <span class="rv-visually-hidden">{option}</span>
          </>
        ),
      }))}
      onChange={onChange}
    />
  ) : (
    <span
      class={`rv-rating ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="img"
      aria-label={`${label}: ${value} / ${max}`}
    >
      {options.map((index) => (
        <RatingStar filled={index <= value} />
      ))}
    </span>
  );
}

// Let native hint and policy adapters recognize these transparent compositions.
registerControl(TextInput, 'input');
registerControl(NumberInput, 'input');
registerControl(Textarea, 'textarea');

export * from './selection-list';
