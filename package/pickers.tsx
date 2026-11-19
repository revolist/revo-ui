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
import { isCalendarDateDisabled, orderCalendarRange } from './calendar/model';
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
import { Dropdown, type DropdownProps } from './dropdown';
import {
  PopoverController,
  DialogController,
  TooltipController,
  attachMenuKeyboard,
} from './surfaces';
import { Button } from './controls';
import type { TooltipControllerOptions } from './core/tooltip-options';
import { DateControl, type DateInputOptions } from './date-time/date-control';
import { avatarTemplate, type AvatarTemplateOptions } from './avatar';
import { renderProgressBar, type ProgressBarProps } from './progress/bar';

export function Combobox<T>(props: DropdownProps<T>) {
  return (
    <Dropdown
      {...props}
      className={`rv-combobox ${props.className ?? ''}`}
      config={{ ...props.config, search: true, multiSelect: false }}
    />
  );
}
export function MultiSelect<T>(props: DropdownProps<T>) {
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

export interface PopoverProps {
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
  open,
  anchor,
  appendTo,
  closeOnOutside,
  closeOnEscape,
  onClose,
  children,
  label,
  className = '',
  role = 'dialog',
  requestDismissal = false,
}: PopoverProps & { requestDismissal?: boolean }) {
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
      class={`rv-popover ${role === 'menu' ? 'rv-menu ' : ''}${className}`}
      role={role}
      aria-label={label}
      hidden={!open}
    >
      {open ? children : null}
    </div>
  );
}

export interface TooltipProps extends TooltipControllerOptions {
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
  const latest = useRef(props);
  latest.current = props;
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
    <span ref={ref} class="rv-tooltip-anchor">
      {props.children}
    </span>
  );
}

export interface DialogProps {
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
  open,
  title,
  closeLabel,
  onClose,
  children,
  footer,
  draggable,
  returnFocus,
}: DialogProps) {
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
    setTargets({ body: handle.body, footer: handle.footer });
    return () => {
      active = false;
      controller.destroy();
    };
  }, [open, title, closeLabel, draggable, returnFocus]);
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
  disabled?: boolean;
  readOnly?: boolean;
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
      isCalendarDateDisabled(date, {
        minDate: options.minDate,
        maxDate: options.maxDate,
        isDisabled: options.isDateDisabled,
      }) ||
        Boolean(
          options.isMonthDisabled?.(
            startOfDisplayMonth(date, options.calendarSystem),
          ),
        ),
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
  onChange: (value?: ISODateString) => void;
  label: string;
  openLabel: string;
}
export function DatePicker({
  value,
  onChange,
  label,
  openLabel,
  disabled,
  readOnly,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  dateInput,
  ...calendarOptions
}: DatePickerProps) {
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
    <div class="rv-date-picker">
      {dateInput !== false && (
        <DateControl
          label={label}
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
              onChange(text || undefined);
          }}
        />
      )}
      <Button
        ref={setAnchor}
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
      </Button>
      <PopoverSurface
        requestDismissal
        open={popupOpen}
        anchor={anchor}
        onClose={() => requestOpen(false)}
        label={label}
      >
        <div id={id} ref={calendar.content} tabIndex={-1}>
          <Calendar
            {...calendarOptions}
            {...calendar.calendarProps}
            selection={selection}
            onSelect={(date) => {
              onChange(date);
              requestOpen(false, true);
            }}
          />
        </div>
      </PopoverSurface>
    </div>
  );
}

export interface DateRangePickerProps extends PopupDatePickerOptions {
  value?: CalendarDateRange;
  onChange: (value: CalendarDateRange) => void;
  label: string;
  fromLabel: string;
  toLabel: string;
  openLabel: string;
}
export function DateRangePicker({
  value,
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
  ...calendarOptions
}: DateRangePickerProps) {
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
  const calendar = useDatePickerCalendar(
    calendarOptions,
    value?.from,
    popupOpen,
  );
  const selection = start ? { from: start, to: start } : value;
  const preview = start && hover ? orderCalendarRange(start, hover) : undefined;
  const clearDraft = () => {
    setStart(undefined);
    setHover(undefined);
  };
  const [id] = useState(() => createControlId('rv-date-picker'));
  const displayValue =
    dateInput === false && value ? `${value.from} – ${value.to}` : undefined;
  useLayoutEffect(clearDraft, [open, value?.from, value?.to]);
  const changeInput = (key: 'from' | 'to', date: string | string[]) => {
    if (typeof date !== 'string' || !isValidIsoDate(date)) return;
    onChange(
      orderCalendarRange(
        key === 'from' ? date : (value?.from ?? date),
        key === 'to' ? date : (value?.to ?? date),
      ),
    );
  };
  return (
    <div class="rv-date-range-picker" role="group" aria-label={label}>
      {dateInput !== false && (
        <>
          <DateControl
            label={fromLabel}
            options={inputOptions}
            value={value?.from ?? ''}
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
            label={toLabel}
            options={inputOptions}
            value={value?.to ?? ''}
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
      <Button
        ref={setAnchor}
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
      </Button>
      <PopoverSurface
        requestDismissal
        open={popupOpen}
        anchor={anchor}
        onClose={() => requestOpen(false)}
        label={label}
      >
        <div id={id} ref={calendar.content} tabIndex={-1}>
          <Calendar
            {...calendarOptions}
            {...calendar.calendarProps}
            selection={selection}
            preview={preview}
            onPreviewDateChange={setHover}
            onSelect={(date) => {
              if (!start) setStart(date);
              else {
                onChange(orderCalendarRange(start, date));
                clearDraft();
                requestOpen(false, true);
              }
            }}
          />
        </div>
      </PopoverSurface>
    </div>
  );
}
