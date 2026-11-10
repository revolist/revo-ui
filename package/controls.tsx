import { useTitleTooltip } from './core/title-tooltip';
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
export type ButtonProps = ButtonAttributes & {
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
  size?: 'compact' | 'default';
};
export const Button = registerControl(
  forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    {
      href,
      target,
      rel,
      rounded = false,
      variant = 'default',
      size = 'default',
      className = '',
      class: nativeClass,
      ...props
    }: ButtonProps,
    ref,
  ) {
    const linkTooltip = useTitleTooltip<HTMLAnchorElement>(
      href !== undefined && typeof props.title === 'string'
        ? props.title
        : undefined,
    );
    const classes = [
      variant === 'default' ? 'rv-btn' : `rv-btn-${variant}`,
      size === 'compact' ? 'rv-btn-sm' : '',
      rounded ? 'rv-btn-rounded' : '',
      nativeClass,
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
          variant === 'default' ? 'rv-btn' : `rv-btn-${variant}`,
          size === 'compact' ? 'rv-btn-sm' : '',
          nativeClass,
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
  variant = 'ghost',
  size = 'default',
  ...props
}: ButtonProps & { label: string; icon?: string; badge?: string | number }) {
  return (
    <SvgButton
      {...props}
      label={label}
      icon={icon}
      badge={badge}
      className={`rv-btn-icon ${variant === 'default' ? 'rv-btn' : `rv-btn-${variant}`} ${size === 'compact' ? 'rv-btn-sm' : ''} ${className}`}
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
};
export function ButtonGroup({ children, className = '', label }: ShellProps) {
  return (
    <div role="group" aria-label={label} class={`rv-btn-group ${className}`}>
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
  id,
  labelledBy,
  active,
  children,
}: {
  id: string;
  labelledBy: string;
  active: boolean;
  children?: ComponentChildren;
}) {
  return (
    <div id={id} role="tabpanel" aria-labelledby={labelledBy} hidden={!active}>
      {children}
    </div>
  );
}

export interface RadioOption<T extends string | number> {
  value: T;
  label: ComponentChildren;
  disabled?: boolean;
}
export function RadioGroup<T extends string | number>({
  className = '',
  value,
  options,
  onChange,
  label,
  disabled,
  name,
}: {
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
    <fieldset class={`rv-radio-group ${className}`} disabled={disabled}>
      <legend>{label}</legend>
      {options.map((option) => (
        <label key={option.value}>
          <Input
            type="radio"
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

export type TextInputProps = Omit<
  JSX.IntrinsicElements['input'],
  'className'
> & { className?: string; onValueChange?: (value: string) => void };
export function TextInput({
  className = '',
  class: nativeClass,
  onValueChange,
  onInput,
  ...props
}: TextInputProps) {
  return (
    <Input
      type="text"
      {...props}
      class={`rv-control ${nativeClass ?? ''} ${className}`}
      onInput={(event) => {
        onInput?.(event);
        if (!event.defaultPrevented) onValueChange?.(event.currentTarget.value);
      }}
    />
  );
}
export function Textarea({
  className = '',
  class: nativeClass,
  onValueChange,
  onInput,
  ...props
}: Omit<JSX.IntrinsicElements['textarea'], 'className'> & {
  className?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <TextArea
      {...props}
      class={`rv-control ${nativeClass ?? ''} ${className}`}
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
export function NumberStepper({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  onChange,
  label,
  decreaseLabel,
  increaseLabel,
  disabled,
  readOnly,
}: {
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
  const set = (next: number) => {
    if (Number.isFinite(next)) onChange(Math.max(min, Math.min(max, next)));
  };
  return (
    <div class="rv-number-stepper" role="group" aria-label={label}>
      <Button
        disabled={disabled || readOnly || value <= min}
        aria-label={decreaseLabel}
        onClick={() => set(value - step)}
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
          if (next !== undefined) set(next);
        }}
      />
      <Button
        disabled={disabled || readOnly || value >= max}
        aria-label={increaseLabel}
        onClick={() => set(value + step)}
      >
        +
      </Button>
    </div>
  );
}
export function DateInput(props: Omit<TextInputProps, 'type'>) {
  return <TextInput {...props} type="date" />;
}
export function TimeInput(props: Omit<TextInputProps, 'type'>) {
  return <TextInput {...props} type="time" />;
}
export function DateTimeInput(props: Omit<TextInputProps, 'type'>) {
  return <TextInput {...props} type="datetime-local" />;
}
export function Chip({ children, className = '' }: ShellProps) {
  return <span class={`rv-btn-pill ${className}`}>{children}</span>;
}
export function FieldHint({ children, id }: ShellProps & { id?: string }) {
  return (
    <span class="rv-field__hint" id={id}>
      {children}
    </span>
  );
}
export function FieldError({ children, id }: ShellProps & { id?: string }) {
  return (
    <span class="rv-field__error" id={id} role="alert">
      {children}
    </span>
  );
}
export function FormSection({
  children,
  title,
  description,
}: ShellProps & { title?: string; description?: string }) {
  return (
    <fieldset class="rv-form-section">
      {title && <legend class="rv-form-section__title">{title}</legend>}
      {description && <p class="rv-form-description">{description}</p>}
      {children}
    </fieldset>
  );
}
export function Disclosure({
  children,
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
      class={`rv-disclosure ${className}`.trim()}
      open={open}
      onToggle={onToggle}
    >
      <summary class="rv-disclosure-summary">{summary}</summary>
      {children}
    </details>
  );
}
export { EditorPane as Pane, EditorSplitLayout as SplitLayout };
export function Panel({ children, className = '', label }: ShellProps) {
  return (
    <section class={`rv-panel ${className}`} aria-label={label}>
      {children}
    </section>
  );
}

export function Toolbar({ children, className = '', label }: ShellProps) {
  return (
    <div class={`rv-toolbar ${className}`} role="toolbar" aria-label={label}>
      {children}
    </div>
  );
}
export function ToolbarGroup({ children, className = '', label }: ShellProps) {
  return (
    <div
      class={`rv-toolbar-group ${className}`}
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}
export function ToolbarSeparator() {
  return (
    <span
      class="rv-toolbar-separator"
      role="separator"
      aria-orientation="vertical"
    />
  );
}
export { Badge } from './badge.view';
export function CountBadge({ count, label }: { count: number; label: string }) {
  return (
    <span class="rv-count" role="img" aria-label={label}>
      {count}
    </span>
  );
}
export { Alert } from './alert';
export function Spinner({ label }: { label: string }) {
  return renderLoadingIndicator(h, { label, showSpinner: true });
}
export function LoadingOverlay({
  busy,
  label,
  children,
}: {
  busy: boolean;
  label: string;
  children?: ComponentChildren;
}) {
  return (
    <div class="rv-loading-container" aria-busy={busy}>
      {children}
      {busy && (
        <div class="rv-loading-overlay">
          <Spinner label={label} />
        </div>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ComponentChildren;
}) {
  return (
    <div class="rv-empty-state">
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}

export function Menu({
  children,
  label,
  onClose,
}: ShellProps & { onClose?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(
    () => (ref.current ? attachMenuKeyboard(ref.current, onClose) : undefined),
    [onClose],
  );
  return (
    <div ref={ref} class="rv-menu" role="menu" aria-label={label}>
      {children}
    </div>
  );
}
export function MenuItem({ children, ...props }: ButtonProps) {
  return (
    <Button variant="ghost" {...props} role="menuitem">
      {children}
    </Button>
  );
}
export function MenuSeparator() {
  return <div role="separator" class="rv-menu-separator" />;
}
export function Submenu({ label, children }: ShellProps & { label: string }) {
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
      class="rv-submenu"
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
export function ResizeHandle(props: ResizeOptions) {
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
      class="rv-resize-handle"
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
export interface PaginationProps {
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
  page,
  pageCount,
  onChange,
  label,
  previousLabel,
  nextLabel,
  firstLabel = 'First page',
  lastLabel = 'Last page',
  variant = 'compact',
  disabled = false,
  navigation = true,
  boundaryButtons = false,
  buttons,
  children,
  className = '',
}: PaginationProps) {
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
      class={`rv-pagination ${variant === 'numbered' ? 'rv-pagination--numbered' : ''} ${className}`}
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
  value,
  min = 0,
  max = 100,
  label,
}: {
  value: number;
  min?: number;
  max?: number;
  label: string;
}) {
  const normalized = normalizeProgressRange(value, min, max);
  return (
    <svg
      viewBox="0 0 36 36"
      class="rv-circular-progress"
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
      />
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="currentColor"
        pathLength="100"
        stroke-dasharray={`${normalized.percent} 100`}
        transform="rotate(-90 18 18)"
      />
    </svg>
  );
}
export function Rating({
  value,
  max = 5,
  label,
  onChange,
  disabled,
}: {
  value: number;
  max?: number;
  label: string;
  onChange?: (value: number) => void;
  disabled?: boolean;
}) {
  const options = Array.from(
    { length: Math.max(0, Math.min(100, Math.floor(max))) },
    (_, index) => index + 1,
  );
  return onChange ? (
    <RadioGroup
      className="rv-rating"
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
      class="rv-rating"
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
registerControl(DateInput, 'input');
registerControl(TimeInput, 'input');
registerControl(DateTimeInput, 'input');
registerControl(Textarea, 'textarea');

export * from './selection-list';
