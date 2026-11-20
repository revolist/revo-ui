import calendarIcon from '@fortawesome/fontawesome-free/svgs/regular/calendar.svg?raw';
import { SvgIcon } from './icons/icon';
import { createControlId } from './core/control-id';
import { h, Fragment, type ComponentChildren } from 'preact';
import { createPortal } from 'preact/compat';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  isValidIsoDate,
  startOfDisplayMonth,
  type ISODateString,
} from '@revolist/ui-dates';
import { Calendar } from './calendar';
import {
  isCalendarDateDisabled,
  isCalendarRangeValid,
  orderCalendarRange,
} from './calendar/model';
import {
  getCalendarInitialDate,
  resolveCalendarReferenceDate,
} from './calendar/reference-date';
import {
  getCalendarSelectionError,
  getCalendarViews,
} from './calendar/selection-validation';
import type {
  CalendarDateRange,
  CalendarProps,
  CalendarView,
} from './calendar/types';
import { Dropdown, type DropdownProps, type DropdownPreset } from './dropdown';
import {
  PopoverController,
  DialogController,
  TooltipController,
  attachMenuKeyboard,
} from './surfaces';
import { Button } from './controls';
import { DEFAULT_CALENDAR_TRANSLATIONS } from './calendar/translations';
import type { TooltipControllerOptions } from './core/tooltip-options';
import { DateControl, type DateInputOptions } from './date-time/date-control';
import { avatarTemplate, type AvatarTemplateOptions } from './avatar';
import { renderProgressBar, type ProgressBarProps } from './progress/bar';

type DropdownPresetConfig = NonNullable<NonNullable<DropdownPreset['props']>['config']>;
/** Search and single selection are owned by Combobox. */
export type ComboboxPreset = { className?: string; props?: { disabled?: boolean; config?: Omit<DropdownPresetConfig, 'search' | 'multiSelect'> } };
/** Multiple selection is owned by MultiSelect. */
export type MultiSelectPreset = { className?: string; props?: { disabled?: boolean; config?: Omit<DropdownPresetConfig, 'multiSelect'> } };
export function Combobox<T>(props: Omit<DropdownProps<T>, 'preset'> & { preset?: ComboboxPreset }) {
  return (
    <Dropdown
      {...props}
      className={`rv-combobox ${props.className ?? ''}`}
      config={{ ...props.config, search: true, multiSelect: false }}
    />
  );
}
export function MultiSelect<T>(props: Omit<DropdownProps<T>, 'preset'> & { preset?: MultiSelectPreset }) {
  return (
    <Dropdown
      {...props}
      className={`rv-multi-select ${props.className ?? ''}`}
      config={{ ...props.config, multiSelect: true }}
    />
  );
}
export function Avatar(props: AvatarTemplateOptions) {
  return avatarTemplate(h, props);
}
export function ProgressBar(props: ProgressBarProps) {
  return renderProgressBar(h, props);
}

export interface PopoverPreset {
  className?: string;
  props?: {
    closeOnOutside?: boolean;
    closeOnEscape?: boolean;
    role?: 'dialog' | 'menu';
  };
}

export interface PopoverProps {
  preset?: PopoverPreset;
  open: boolean;
  anchor: HTMLElement | null;
  /** Optional mount scope for inherited theme tokens and text direction. */
  appendTo?: HTMLElement;
  onClose: () => void;
  /** Close on pointer presses outside the anchor and content. Defaults to true. */
  closeOnOutside?: boolean;
  /** Close on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  children?: ComponentChildren;
  label?: string;
  className?: string;
  role?: 'dialog' | 'menu';
}
export function Popover(props: PopoverProps) {
  return <PopoverSurface {...props} />;
}

function PopoverSurface({
  preset,
  open,
  anchor,
  appendTo,
  closeOnOutside: closeOnOutsideProp,
  closeOnEscape: closeOnEscapeProp,
  onClose,
  children,
  label,
  className = '',
  role: roleProp,
  requestDismissal = false,
}: PopoverProps & { requestDismissal?: boolean }) {
  const closeOnOutside = closeOnOutsideProp ?? preset?.props?.closeOnOutside;
  const closeOnEscape = closeOnEscapeProp ?? preset?.props?.closeOnEscape;
  const role = roleProp ?? preset?.props?.role ?? 'dialog';
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // Keep event policy live without moving the open surface or interrupting focus.
  const dismissal = useRef({ closeOnOutside, closeOnEscape }).current;
  dismissal.closeOnOutside = closeOnOutside;
  dismissal.closeOnEscape = closeOnEscape;
  useLayoutEffect(() => {
    if (!open || !anchor || !ref.current) return;
    const content = ref.current;
    const controller = new PopoverController();
    let active = true;
    let restoreFocus = false;
    const requestDismiss = (restore: boolean) => {
      restoreFocus = restore;
      closeRef.current();
    };
    controller.open({
      anchor,
      appendTo,
      get closeOnOutside() {
        return dismissal.closeOnOutside;
      },
      get closeOnEscape() {
        return dismissal.closeOnEscape;
      },
      content: ref.current,
      display: role === 'menu' ? 'grid' : undefined,
      onDismissRequest: requestDismissal ? requestDismiss : undefined,
      onClose: () => {
        if (active) closeRef.current();
      },
    });
    const detachMenu =
      role === 'menu'
        ? attachMenuKeyboard(content, () => controller.close(), dismissal)
        : undefined;
    return () => {
      active = false;
      detachMenu?.();
      controller.destroy();
      if (restoreFocus && anchor.isConnected && !anchor.matches(':disabled'))
        anchor.focus({ preventScroll: true });
      // Native teardown restores the state from opening; controlled closure wins.
      content.hidden = true;
    };
  }, [open, anchor, role, appendTo, requestDismissal]);
  return (
    <div
      ref={ref}
      class={`rv-popover ${role === 'menu' ? 'rv-menu ' : ''}${preset?.className ?? ''} ${className}`}
      data-part="root"
      role={role}
      aria-label={label}
      hidden={!open}
    >
      {open ? children : null}
    </div>
  );
}

export type TooltipPreset = import('./presets/types').ClassPreset & { props?: { side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'; align?: 'start' | 'center' | 'end'; trigger?: 'hover' | 'focus' | 'click' | 'manual'; delay?: number; arrow?: boolean; disabled?: boolean; closeOnEscape?: boolean; closeOnOutside?: boolean; autoHide?: boolean } };
export interface TooltipProps extends TooltipControllerOptions {
  preset?: TooltipPreset;
  /** Simple text remains supported; content/renderContent can provide rich non-interactive descriptions. */
  text?: string;
  content?: import('./core/tooltip-options').TooltipContent;
  children?: ComponentChildren;
  defaultOpen?: boolean;
  /** Position against an external trigger. Otherwise the first focusable child is used. */
  anchor?: HTMLElement | SVGElement | null;
}
export function Tooltip(props: TooltipProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const defaults = Object.fromEntries(Object.entries(props.preset?.props ?? {}).filter(([key]) => (props as unknown as Record<string, unknown>)[key] === undefined));
  const options = { ...props, ...defaults, className: [props.preset?.className, props.className].filter(Boolean).join(' ') || undefined };
  const latest = useRef(options);
  latest.current = options;
  const [controller] = useState(() => new TooltipController());
  const initial = useRef(false);
  const reopenAfterBind = useRef(false);
  const synchronize = () => {
    const options = latest.current;
    controller.update(options);
    controller.setContent(options.content ?? options.text ?? '');
    if (options.open !== undefined) controller.setOpen(options.open);
    else if (!initial.current) {
      initial.current = true;
      if (options.defaultOpen) controller.setOpen(true);
    }
  };
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    let anchor: HTMLElement | SVGElement | undefined;
    const bind = () => {
      const options = latest.current;
      const next =
        options.anchor ??
        (options.filter
          ? root
          : (root.querySelector<HTMLElement>(
              'button, input, textarea, select, a[href], summary, [contenteditable]:not([contenteditable="false"]), [tabindex]',
            ) ?? root));
      if (next === anchor) return;
      const wasOpen = controller.isOpen || reopenAfterBind.current;
      reopenAfterBind.current = false;
      controller.bind(next, options.content ?? options.text ?? '', options);
      controller.element?.setAttribute('data-preset-surface', '');
      anchor = next;
      synchronize();
      if (wasOpen && options.open === undefined) controller.setOpen(true);
    };
    bind();
    // Framework-owned content can arrive after the surrounding layout effect.
    const observer = new root.ownerDocument.defaultView!.MutationObserver(bind);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'tabindex', 'contenteditable'],
    });
    root.addEventListener('focus', bind, true);
    root.addEventListener('pointerenter', bind, true);
    return () => {
      observer.disconnect();
      root.removeEventListener('focus', bind, true);
      root.removeEventListener('pointerenter', bind, true);
      reopenAfterBind.current = controller.isOpen;
      controller.destroy();
    };
  }, [controller, props.anchor, props.filter]);
  useLayoutEffect(synchronize);
  return (
    <span ref={ref} class={`rv-tooltip-anchor ${props.preset?.className ?? ''}`} data-part="root">
      {props.children}
    </span>
  );
}

export interface DialogPreset {
  className?: string;
  props?: { draggable?: boolean };
}

export interface DialogProps {
  preset?: DialogPreset;
  open: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children?: ComponentChildren;
  footer?: ComponentChildren;
  draggable?: boolean;
  returnFocus?: HTMLElement;
}
export function Dialog({
  preset,
  open,
  title,
  closeLabel,
  onClose,
  children,
  footer,
  draggable: draggableProp,
  returnFocus,
}: DialogProps) {
  const draggable = draggableProp ?? preset?.props?.draggable;
  const surface = useRef<HTMLElement>();
  const placeholder = useRef<HTMLSpanElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [targets, setTargets] = useState<{
    body: HTMLElement;
    footer: HTMLElement;
  }>();
  useLayoutEffect(() => {
    if (!open || !placeholder.current) {
      setTargets(undefined);
      return;
    }
    const controller = new DialogController(placeholder.current.ownerDocument);
    let active = true;
    const handle = controller.open({
      title,
      closeLabel,
      draggable,
      returnFocus,
      surfaceClass: 'rv-ui-dialog',
      onClose: () => {
        setTargets(undefined);
        if (active) closeRef.current();
      },
    });
    surface.current = handle.surface;
    handle.surface.setAttribute('data-part', 'root');
    setTargets({ body: handle.body, footer: handle.footer });
    return () => {
      active = false;
      controller.destroy();
      surface.current = undefined;
    };
  }, [open, title, closeLabel, draggable, returnFocus]);
  useLayoutEffect(() => {
    const element = surface.current;
    if (!element) return;
    const classes = (preset?.className ?? '').split(/\s+/).filter(Boolean);
    const added = classes.filter((name) => !element.classList.contains(name));
    element.classList.add(...added);
    return () => element.classList.remove(...added);
  }, [open, title, closeLabel, draggable, returnFocus, preset?.className]);
  return (
    <>
      <span ref={placeholder} hidden />
      {targets && createPortal(children, targets.body)}
      {targets && footer && createPortal(footer, targets.footer)}
    </>
  );
}
export { DialogHeader, DialogBody, DialogFooter } from './dialog/dialog.parts';
export function ConfirmDialog({
  onConfirm,
  confirmLabel,
  cancelLabel,
  pending,
  ...props
}: DialogProps & {
  onConfirm: () => void;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
}) {
  return (
    <Dialog
      {...props}
      footer={
        <>
          <Button disabled={pending} onClick={props.onClose}>
            {cancelLabel}
          </Button>
          <Button variant="primary" disabled={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}

/** Forward calendar presentation/validation options; selection and focus remain picker-owned. */
type CalendarOptions = Omit<
  CalendarProps,
  | 'month'
  | 'focusedDate'
  | 'selection'
  | 'preview'
  | 'selectedDates'
  | 'onMonthChange'
  | 'onFocusedDateChange'
  | 'onSelect'
  | 'onPresetSelect'
  | 'onPreviewDateChange'
>;
interface PopupDatePickerOptions extends CalendarOptions {
  /** Controlled popup visibility. */
  open?: boolean;
  /** Initial popup visibility in uncontrolled mode. Defaults to false. */
  defaultOpen?: boolean;
  /** Requests a visibility change after trigger, selection or dismissal. */
  onOpenChange?: (open: boolean) => void;
  /** Configure typed date entry, or hide the input with false. Entry defaults to ISO. */
  dateInput?: boolean | DateInputOptions;
  /** Controlled visible calendar month, specified as an ISO civil date. */
  month?: ISODateString;
  /** Initial visible month for uncontrolled navigation. */
  defaultMonth?: ISODateString;
  /** Requests the first day of the newly visible month after calendar navigation. */
  onMonthChange?: (month: ISODateString) => void;
  /** Close after a complete calendar selection. Defaults to true. */
  closeOnSelect?: boolean;
  /** Require a committed selection before submitting the enclosing form. */
  required?: boolean;
  /** Show a clear button for an existing selection. */
  clearable?: boolean;
  /** Localized text and accessible name for the clear button. */
  clearLabel?: string;
  /** Mount scope and dismissal options for the calendar popup. */
  popup?: Pick<PopoverProps, 'appendTo' | 'closeOnOutside' | 'closeOnEscape'>;
  /** Replace the calendar trigger. Forward the provided props and text to a button. */
  renderTrigger?: (props: DatePickerTriggerProps) => ComponentChildren;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface DatePickerTriggerProps {
  type: 'button';
  disabled?: boolean;
  'aria-label': string;
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
  'aria-controls': string;
  'aria-describedby'?: string;
  ref: (element: HTMLButtonElement | null) => void;
  onClick: (event?: unknown) => void;
  /** Framework-neutral text for a custom trigger button. */
  children: string;
}

function PickerTrigger({
  render,
  triggerRef,
  children,
  displayValue,
  ...props
}: Omit<DatePickerTriggerProps, 'ref' | 'children'> & {
  render?: PopupDatePickerOptions['renderTrigger'];
  triggerRef: DatePickerTriggerProps['ref'];
  children: ComponentChildren;
  displayValue?: string;
}) {
  const attributes = { ...props, ref: triggerRef };
  if (!render) return <Button {...attributes}>{children}</Button>;
  return (
    <>
      {displayValue && (
        <span hidden id={props['aria-describedby']}>
          {displayValue}
        </span>
      )}
      {render({
        ...attributes,
        children: displayValue ?? props['aria-label'],
      })}
    </>
  );
}

function usePickerValue<T>(props: { value?: T; defaultValue?: T }) {
  const defaultValue = useRef(props.defaultValue);
  const [localValue, setLocalValue] = useState(defaultValue.current);
  const root = useRef<HTMLDivElement>(null);
  const [resetKey, setResetKey] = useState(0);
  const controlled = Object.hasOwn(props, 'value');

  useLayoutEffect(() => {
    const form = root.current?.closest('form');
    if (!form) return;
    let active = true;
    const reset = (event: Event) => {
      // Native reset writes to input elements after dispatching this event.
      queueMicrotask(() => {
        if (!active || event.defaultPrevented) return;
        if (!controlled) setLocalValue(defaultValue.current);
        setResetKey((key) => key + 1);
      });
    };
    form.addEventListener('reset', reset);
    return () => {
      active = false;
      form.removeEventListener('reset', reset);
    };
  }, [controlled]);

  return {
    root,
    resetKey,
    value: controlled ? props.value : localValue,
    setValue: (value?: T) => {
      if (!controlled) setLocalValue(value);
    },
  };
}

function PickerFormFields({
  fields,
  required,
  disabled,
  readOnly,
  anchor,
}: {
  fields: readonly { name?: string; value?: ISODateString }[];
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  anchor: HTMLButtonElement | null;
}) {
  return (
    <>
      {fields.map(
        ({ name, value }, index) =>
          name && (
            <input
              key={index}
              type="hidden"
              name={name}
              value={value ?? ''}
              disabled={disabled}
            />
          ),
      )}
      {required && !readOnly && (
        <input
          type="text"
          class="rv-visually-hidden"
          aria-hidden="true"
          tabIndex={-1}
          required
          disabled={disabled}
          value={fields.every(({ value }) => isValidIsoDate(value)) ? '1' : ''}
          onInvalid={(event) => {
            event.preventDefault();
            anchor?.focus();
          }}
        />
      )}
    </>
  );
}

function useDatePickerPopup({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled,
  readOnly,
}: Pick<
  PopupDatePickerOptions,
  'open' | 'defaultOpen' | 'onOpenChange' | 'disabled' | 'readOnly'
>) {
  const blocked = disabled || readOnly;
  const [localOpen, setOpen] = useState(defaultOpen && !blocked);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const open = !blocked && (controlledOpen ?? localOpen);
  const restoreFocus = useRef(false);
  useLayoutEffect(() => {
    if (blocked) setOpen(false);
    if (!open && restoreFocus.current) {
      restoreFocus.current = false;
      if (!blocked) anchor?.focus({ preventScroll: true });
    }
  }, [blocked, open, anchor]);
  const requestOpen = (next: boolean, restore = false) => {
    if (blocked || next === open) return;
    restoreFocus.current = restore;
    if (controlledOpen === undefined) setOpen(next);
    onOpenChange?.(next);
  };
  return { open, anchor, setAnchor, requestOpen };
}

function isPickerDateBlocked(date: ISODateString, options: CalendarOptions) {
  return (
    !isValidIsoDate(date) ||
    isCalendarDateDisabled(date, {
      minDate: options.minDate,
      maxDate: options.maxDate,
      isDisabled: options.isDateDisabled,
    }) ||
    Boolean(
      options.isMonthDisabled?.(
        startOfDisplayMonth(date, options.calendarSystem),
      ),
    )
  );
}

function useDatePickerCalendar(
  options: CalendarOptions &
    Pick<PopupDatePickerOptions, 'month' | 'defaultMonth' | 'onMonthChange'>,
  selected: ISODateString | undefined,
  open: boolean,
) {
  const initial = getCalendarInitialDate(options, selected);
  const displayMonth = startOfDisplayMonth(initial, options.calendarSystem);
  const [focusedDate, setFocusedDate] = useState(initial);
  const [localMonth, setMonth] = useState(options.defaultMonth ?? displayMonth);
  const month = startOfDisplayMonth(
    options.month ?? localMonth,
    options.calendarSystem,
  );
  const views = getCalendarViews(options);
  const defaultView =
    options.defaultView && views.includes(options.defaultView)
      ? options.defaultView
      : views[0];
  const [view, setView] = useState<CalendarView>(defaultView);
  const content = useRef<HTMLDivElement>(null);

  const wasOpen = useRef(false);
  const previousInitial = useRef({ initial, displayMonth });
  const restoreGridFocus = useRef(false);
  useLayoutEffect(() => {
    const opening = open && !wasOpen.current;
    if (opening) setView(defaultView);
    const previous = previousInitial.current;
    previousInitial.current = { initial, displayMonth };
    const changed =
      previous.initial !== initial || previous.displayMonth !== displayMonth;
    const hasSelection = isValidIsoDate(selected);
    const hasDefaultMonth = options.defaultMonth !== undefined;
    const followChangedDate = changed && (!hasDefaultMonth || hasSelection);
    const reopenSelection = opening && hasSelection && !hasDefaultMonth;
    if (!followChangedDate && !reopenSelection) return;
    const popup = content.current;
    const active = popup?.ownerDocument.activeElement;
    restoreGridFocus.current =
      opening ||
      Boolean(
        active?.hasAttribute('data-calendar-date') && popup?.contains(active),
      );
    setFocusedDate(initial);
    if (options.month === undefined) setMonth(displayMonth);
  }, [initial, displayMonth, open]);
  useLayoutEffect(() => {
    const justOpened = open && !wasOpen.current;
    wasOpen.current = open;
    const popup = content.current;
    if (!open || !popup || (!justOpened && !restoreGridFocus.current)) return;
    if (
      restoreGridFocus.current &&
      (focusedDate !== initial ||
        (options.month === undefined && month !== displayMonth))
    )
      return;
    restoreGridFocus.current = false;
    const target =
      popup.querySelector<HTMLButtonElement>(
        'button[data-calendar-date][tabindex="0"]:not([disabled]), button[data-calendar-month][aria-pressed="true"]:not([disabled])',
      ) ??
      popup.querySelector<HTMLButtonElement>(
        'button[data-calendar-month]:not([disabled])',
      ) ??
      popup.querySelector<HTMLButtonElement>('button:not([disabled])');
    (target ?? popup).focus({ preventScroll: true });
  }, [open, initial, displayMonth, focusedDate, month, options.month]);

  const validateTypedDate = (
    date: ISODateString,
    selection?: CalendarDateRange,
    preview?: CalendarDateRange,
  ) => {
    const error = getCalendarSelectionError(
      options,
      date,
      {
        month,
        view: open && views.includes(view) ? view : defaultView,
        selection,
        preview,
        referenceDate: resolveCalendarReferenceDate(options),
      },
      isPickerDateBlocked(date, options),
    );
    if (error === undefined) return true;
    options.onInvalidSelection?.(error, date);
    return false;
  };

  return {
    content,
    validateTypedDate,
    calendarProps: {
      month,
      focusedDate,
      onMonthChange: (next: ISODateString) => {
        if (next === month) return;
        if (options.month === undefined) setMonth(next);
        options.onMonthChange?.(next);
      },
      onFocusedDateChange: setFocusedDate,
      onViewChange: (next: CalendarView) => {
        setView(next);
        options.onViewChange?.(next);
      },
    },
  };
}

export interface DatePickerProps extends PopupDatePickerOptions {
  value?: ISODateString;
  /** Initial uncontrolled ISO date. */
  defaultValue?: ISODateString;
  /** Emits the committed ISO date, or undefined when it is cleared. */
  onChange?: (value?: ISODateString) => void;
  /** Form field name for the submitted ISO date. */
  name?: string;
  label: string;
  openLabel: string;
}
export function DatePicker(props: DatePickerProps) {
  const {
    value: _value,
    defaultValue: _defaultValue,
    name,
    onChange,
    label,
    openLabel,
    disabled,
    readOnly,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    dateInput,
    closeOnSelect = true,
    required,
    clearable,
    clearLabel = 'Clear date',
    popup,
    renderTrigger,
    ...calendarOptions
  } = props;
  const { root, resetKey, value, setValue } = usePickerValue(props);
  const commit = (date?: ISODateString) => {
    setValue(date);
    onChange?.(date);
  };
  const { open, anchor, setAnchor, requestOpen } = useDatePickerPopup({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    disabled,
    readOnly,
  });
  const popupOpen = open && anchor !== null;
  const inputOptions =
    typeof dateInput === 'object'
      ? { locale: calendarOptions.locale, ...dateInput }
      : undefined;
  const calendar = useDatePickerCalendar(calendarOptions, value, popupOpen);
  const selection = value ? { from: value, to: value } : undefined;
  const [id] = useState(() => createControlId('rv-date-picker'));
  const displayValue = dateInput === false ? value : undefined;
  return (
    <div ref={root} class={`rv-date-picker ${calendarOptions.preset?.className ?? ''}`} data-part="picker" data-preset-scope="root">
      {dateInput !== false && (
        <DateControl
          key={resetKey}
          label={label}
          required={required}
          options={inputOptions}
          value={value ?? ''}
          minDate={calendarOptions.minDate}
          maxDate={calendarOptions.maxDate}
          disabled={disabled}
          readOnly={readOnly}
          acceptDate={(date) => calendar.validateTypedDate(date, selection)}
          onChange={(text) => {
            if (
              text === '' ||
              (typeof text === 'string' && isValidIsoDate(text))
            )
              commit(text || undefined);
          }}
        />
      )}
      <PickerFormFields
        key={resetKey}
        fields={[{ name, value }]}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        anchor={anchor}
      />
      <PickerTrigger
        render={renderTrigger}
        displayValue={displayValue}
        type="button"
        triggerRef={setAnchor}
        aria-label={openLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={displayValue ? `${id}-value` : undefined}
        aria-controls={id}
        disabled={disabled || readOnly}
        onClick={() => requestOpen(!open)}
      >
        {displayValue && <span id={`${id}-value`}>{displayValue}</span>}
        <SvgIcon svg={calendarIcon} />
      </PickerTrigger>
      {clearable && value && (
        <Button
          type="button"
          disabled={disabled || readOnly}
          onClick={() => {
            commit();
            anchor?.focus();
          }}
        >
          {clearLabel}
        </Button>
      )}
      <PopoverSurface
        {...popup}
        requestDismissal
        open={popupOpen}
        anchor={anchor}
        onClose={() => requestOpen(false)}
        label={label}
      >
        <div id={id} ref={calendar.content} tabIndex={-1}>
          <Calendar
            {...calendarOptions}
            presetSurface
            {...calendar.calendarProps}
            selection={selection}
            onSelect={(date) => {
              commit(date);
              if (closeOnSelect) requestOpen(false, true);
            }}
          />
        </div>
      </PopoverSurface>
    </div>
  );
}

export interface DateRangePickerProps extends Omit<
  PopupDatePickerOptions,
  'presets'
> {
  value?: CalendarDateRange;
  /** Initial uncontrolled ISO range. */
  defaultValue?: CalendarDateRange;
  /** Emits a complete, ordered ISO range. */
  onChange?: (value: CalendarDateRange) => void;
  /** Requests clearing a controlled range. */
  onClear?: () => void;
  /** Form field name for the ISO start date. */
  fromName?: string;
  /** Form field name for the ISO end date. */
  toName?: string;
  /** Minimum length in nights. Defaults to zero. */
  min?: number;
  /** Maximum length in nights. */
  max?: number;
  /** Reject ranges containing disabled interior dates. */
  excludeDisabled?: boolean;
  /** Preset endpoints or complete ISO ranges. */
  presets?: readonly (
    | { label: string; date: ISODateString }
    | { label: string; selection: CalendarDateRange }
  )[];
  label: string;
  fromLabel: string;
  toLabel: string;
  openLabel: string;
}
export function DateRangePicker(props: DateRangePickerProps) {
  const {
    value: _value,
    defaultValue: _defaultValue,
    onClear,
    fromName,
    toName,
    min = 0,
    max = Infinity,
    excludeDisabled = false,
    presets,
    onChange,
    label,
    fromLabel,
    toLabel,
    openLabel,
    disabled,
    readOnly,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    dateInput,
    closeOnSelect = true,
    required,
    clearable,
    clearLabel = 'Clear date range',
    popup,
    renderTrigger,
    ...calendarOptions
  } = props;
  const { root, resetKey, value, setValue } = usePickerValue(props);
  const commit = (range: CalendarDateRange) => {
    setValue(range);
    onChange?.(range);
  };
  const { open, anchor, setAnchor, requestOpen } = useDatePickerPopup({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    disabled,
    readOnly,
  });
  const popupOpen = open && anchor !== null;
  const inputOptions =
    typeof dateInput === 'object'
      ? { locale: calendarOptions.locale, ...dateInput }
      : undefined;
  const [start, setStart] = useState<ISODateString>();
  const [hover, setHover] = useState<ISODateString>();
  const [typedDraft, setTypedDraft] = useState<Partial<CalendarDateRange>>();
  const [invalidEndpoint, setInvalidEndpoint] = useState<'from' | 'to'>();
  const calendar = useDatePickerCalendar(
    calendarOptions,
    value?.from,
    popupOpen,
  );
  const blocked = (date: ISODateString) =>
    isPickerDateBlocked(date, calendarOptions);
  const activeStart = start && !blocked(start) ? start : undefined;
  const selection = activeStart
    ? { from: activeStart, to: activeStart }
    : value;
  const preview =
    activeStart && hover ? orderCalendarRange(activeStart, hover) : undefined;
  const clearDraft = () => {
    setStart(undefined);
    setHover(undefined);
  };
  const [id] = useState(() => createControlId('rv-date-picker'));
  const displayValue =
    dateInput === false && value ? `${value.from} – ${value.to}` : undefined;
  const clearTypedDraft = () => {
    setTypedDraft(undefined);
    setInvalidEndpoint(undefined);
  };
  useLayoutEffect(clearDraft, [open, resetKey, value?.from, value?.to]);
  useLayoutEffect(() => {
    if (start && !activeStart) clearDraft();
  }, [start, activeStart]);
  useLayoutEffect(clearTypedDraft, [resetKey, value?.from, value?.to]);
  const rangeValid = (range: CalendarDateRange) =>
    isCalendarRangeValid(
      range,
      min,
      max,
      blocked,
      excludeDisabled &&
        (calendarOptions.isDateDisabled || calendarOptions.isMonthDisabled)
        ? blocked
        : undefined,
    );
  const rejectRange = (date: ISODateString) =>
    calendarOptions.onInvalidSelection?.(
      calendarOptions.translations?.invalidSelection ??
        DEFAULT_CALENDAR_TRANSLATIONS.invalidSelection,
      date,
    );
  const completeRange = (range: CalendarDateRange) => {
    commit(range);
    clearTypedDraft();
    clearDraft();
    if (closeOnSelect) requestOpen(false, true);
  };
  const rangePresets = presets?.filter((preset) => 'selection' in preset);
  const changeInput = (key: 'from' | 'to', date: string | string[]) => {
    if (date === '') {
      setTypedDraft((draft) => ({ ...draft, [key]: undefined }));
      setInvalidEndpoint(undefined);
      return;
    }
    if (typeof date !== 'string' || !isValidIsoDate(date)) return;
    const draft = { ...typedDraft, [key]: date };
    const otherKey = key === 'from' ? 'to' : 'from';
    const other = draft[otherKey] ?? value?.[otherKey];
    const range =
      other || min <= 0 ? orderCalendarRange(date, other ?? date) : undefined;
    if (range && rangeValid(range)) {
      clearTypedDraft();
      commit(range);
      return;
    }
    // Keep individually valid endpoints so a second edit can complete the range.
    setTypedDraft(draft);
    setInvalidEndpoint(range ? key : undefined);
    if (range) rejectRange(date);
  };
  return (
    <div
      ref={root}
      class={`rv-date-range-picker ${calendarOptions.preset?.className ?? ''}`}
      data-part="picker"
      data-preset-scope="root"
      role="group"
      aria-label={label}
    >
      {dateInput !== false && (
        <>
          <DateControl
            key={`from-${resetKey}`}
            label={fromLabel}
            required={required}
            options={inputOptions}
            value={typedDraft?.from ?? value?.from ?? ''}
            invalid={invalidEndpoint === 'from'}
            disabled={disabled}
            readOnly={readOnly}
            minDate={calendarOptions.minDate}
            maxDate={calendarOptions.maxDate}
            acceptDate={(date) =>
              calendar.validateTypedDate(date, selection, preview)
            }
            onChange={(date) => changeInput('from', date)}
          />
          <DateControl
            key={`to-${resetKey}`}
            label={toLabel}
            required={required}
            options={inputOptions}
            value={typedDraft?.to ?? value?.to ?? ''}
            invalid={invalidEndpoint === 'to'}
            disabled={disabled}
            readOnly={readOnly}
            minDate={calendarOptions.minDate}
            maxDate={calendarOptions.maxDate}
            acceptDate={(date) =>
              calendar.validateTypedDate(date, selection, preview)
            }
            onChange={(date) => changeInput('to', date)}
          />
        </>
      )}
      <PickerFormFields
        key={resetKey}
        fields={[
          { name: fromName, value: value?.from },
          { name: toName, value: value?.to },
        ]}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        anchor={anchor}
      />
      <PickerTrigger
        render={renderTrigger}
        displayValue={displayValue}
        type="button"
        triggerRef={setAnchor}
        disabled={disabled || readOnly}
        aria-label={openLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={displayValue ? `${id}-value` : undefined}
        aria-controls={id}
        onClick={() => requestOpen(!open)}
      >
        {displayValue && <span id={`${id}-value`}>{displayValue}</span>}
        <SvgIcon svg={calendarIcon} />
      </PickerTrigger>
      {clearable && value && (onClear || !Object.hasOwn(props, 'value')) && (
        <Button
          type="button"
          disabled={disabled || readOnly}
          onClick={() => {
            setValue(undefined);
            clearTypedDraft();
            clearDraft();
            onClear?.();
            anchor?.focus();
          }}
        >
          {clearLabel}
        </Button>
      )}
      <PopoverSurface
        {...popup}
        requestDismissal
        open={popupOpen}
        anchor={anchor}
        onClose={() => requestOpen(false)}
        label={label}
      >
        <div id={id} ref={calendar.content} tabIndex={-1}>
          <Calendar
            {...calendarOptions}
            presetSurface
            {...calendar.calendarProps}
            selection={selection}
            preview={preview}
            onPreviewDateChange={setHover}
            presets={presets?.filter((preset) => 'date' in preset)}
            footer={
              rangePresets?.length ? (
                <>
                  <div class="revo-calendar__presets">
                    {rangePresets.map(({ label, selection: range }) => (
                      <Button
                        key={label}
                        onClick={() => {
                          if (!rangeValid(range)) {
                            rejectRange(range.to);
                            return;
                          }
                          if (
                            !calendar.validateTypedDate(
                              range.from,
                              selection,
                              preview,
                            ) ||
                            (range.to !== range.from &&
                              !calendar.validateTypedDate(
                                range.to,
                                selection,
                                preview,
                              ))
                          )
                            return;
                          completeRange(range);
                          calendar.calendarProps.onFocusedDateChange(
                            range.from,
                          );
                          calendar.calendarProps.onMonthChange(
                            startOfDisplayMonth(
                              range.from,
                              calendarOptions.calendarSystem,
                            ),
                          );
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  {calendarOptions.footer}
                </>
              ) : (
                calendarOptions.footer
              )
            }
            onSelect={(date) => {
              if (!activeStart) setStart(date);
              else {
                const range = orderCalendarRange(activeStart, date);
                if (rangeValid(range)) completeRange(range);
                else rejectRange(date);
              }
            }}
          />
        </div>
      </PopoverSurface>
    </div>
  );
}
