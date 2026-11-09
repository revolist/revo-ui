import calendarIcon from '@fortawesome/fontawesome-free/svgs/regular/calendar.svg?raw';
import { SvgIcon } from './icons/icon';
import { createControlId } from './core/control-id';
import { h, Fragment, type ComponentChildren } from 'preact';
import { createPortal } from 'preact/compat';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  isValidIsoDate,
  startOfDisplayMonth,
  todayIsoDate,
  type ISODateString,
} from '@revolist/dates';
import { Calendar } from './calendar';
import { orderCalendarRange } from './calendar/model';
import type { CalendarDateRange, CalendarProps } from './calendar/types';
import { Dropdown, type DropdownProps } from './dropdown';
import {
  PopoverController,
  DialogController,
  TooltipController,
  attachMenuKeyboard,
} from './surfaces';
import { Button } from './controls';
import { DateControl } from './date-time/date-control';
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
export function Popover({
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
}: PopoverProps) {
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
      // Native teardown restores the state from opening; controlled closure wins.
      content.hidden = true;
    };
  }, [open, anchor, role, appendTo]);
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

export function Tooltip({
  text,
  children,
}: {
  text: string;
  children: ComponentChildren;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const tooltip = new TooltipController();
    let anchor: HTMLElement | undefined;
    const bind = () => {
      const next =
        root.querySelector<HTMLElement>('button, input, a[href], [tabindex]') ??
        root;
      if (next === anchor) return;
      tooltip.bind(next, text);
      anchor = next;
    };
    bind();
    // Framework portals/snippets can populate or replace the trigger after the
    // surrounding Preact layout effect has run. Observe only trigger structure.
    const observer = new root.ownerDocument.defaultView!.MutationObserver(bind);
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'tabindex'],
    });
    // Capture also handles autofocus before the observer's next microtask, while
    // allowing the controller's newly bound target listener to see that focus.
    root.addEventListener('focus', bind, true);
    root.addEventListener('pointerenter', bind, true);
    return () => {
      observer.disconnect();
      root.removeEventListener('focus', bind, true);
      root.removeEventListener('pointerenter', bind, true);
      tooltip.destroy();
    };
  }, [text]);
  return (
    <span ref={ref} class="rv-tooltip-anchor">
      {children}
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
export interface DatePickerProps extends CalendarOptions {
  value?: ISODateString;
  onChange: (value?: ISODateString) => void;
  label: string;
  openLabel: string;
  disabled?: boolean;
  readOnly?: boolean;
}
export function DatePicker({
  value,
  onChange,
  label,
  openLabel,
  disabled,
  readOnly,
  ...calendarOptions
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [focused, setFocused] = useState<ISODateString>(
    value && isValidIsoDate(value) ? value : todayIsoDate(),
  );
  const [month, setMonth] = useState(
    startOfDisplayMonth(focused, calendarOptions.calendarSystem),
  );
  const [id] = useState(() => createControlId('rv-date-picker'));
  useLayoutEffect(() => {
    if (disabled || readOnly) setOpen(false);
  }, [disabled, readOnly]);
  return (
    <div class="rv-date-picker">
      <DateControl
        label={label}
        value={value ?? ''}
        minDate={calendarOptions.minDate}
        maxDate={calendarOptions.maxDate}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(text) => {
          if (typeof text !== 'string' || disabled || readOnly) return;
          if (
            text &&
            ((calendarOptions.minDate && text < calendarOptions.minDate) ||
              (calendarOptions.maxDate && text > calendarOptions.maxDate))
          )
            return;
          if (!text || isValidIsoDate(text))
            onChange(text ? (text as ISODateString) : undefined);
        }}
      />
      <Button
        ref={setAnchor}
        aria-label={openLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled || readOnly}
        onClick={() => {
          if (value && isValidIsoDate(value)) {
            setFocused(value);
            setMonth(
              startOfDisplayMonth(value, calendarOptions.calendarSystem),
            );
          }
          setOpen(!open);
        }}
      >
        <SvgIcon svg={calendarIcon} />
      </Button>
      <Popover
        open={open}
        anchor={anchor}
        onClose={() => setOpen(false)}
        label={label}
      >
        <div id={id}>
          <Calendar
            {...calendarOptions}
            month={month}
            focusedDate={focused}
            selection={value ? { from: value, to: value } : undefined}
            onMonthChange={setMonth}
            onFocusedDateChange={setFocused}
            onSelect={(date) => {
              onChange(date);
              setOpen(false);
              anchor?.focus();
            }}
          />
        </div>
      </Popover>
    </div>
  );
}

export interface DateRangePickerProps extends CalendarOptions {
  value?: CalendarDateRange;
  onChange: (value: CalendarDateRange) => void;
  label: string;
  fromLabel: string;
  toLabel: string;
  openLabel: string;
  disabled?: boolean;
  readOnly?: boolean;
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
  ...calendarOptions
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [start, setStart] = useState<ISODateString>();
  const [focused, setFocused] = useState<ISODateString>(
    value?.from ?? todayIsoDate(),
  );
  const [month, setMonth] = useState(
    startOfDisplayMonth(focused, calendarOptions.calendarSystem),
  );
  const [id] = useState(() => createControlId('rv-date-picker'));
  useLayoutEffect(() => {
    if (disabled || readOnly) {
      setOpen(false);
      setStart(undefined);
    }
  }, [disabled, readOnly]);
  const changeInput = (key: 'from' | 'to', text: string) => {
    if (
      disabled ||
      readOnly ||
      !isValidIsoDate(text) ||
      (calendarOptions.minDate && text < calendarOptions.minDate) ||
      (calendarOptions.maxDate && text > calendarOptions.maxDate)
    )
      return;
    const date = text as ISODateString;
    onChange(
      orderCalendarRange(
        key === 'from' ? date : (value?.from ?? date),
        key === 'to' ? date : (value?.to ?? date),
      ),
    );
  };
  return (
    <div class="rv-date-range-picker" role="group" aria-label={label}>
      <DateControl
        label={fromLabel}
        value={value?.from ?? ''}
        disabled={disabled}
        readOnly={readOnly}
        minDate={calendarOptions.minDate}
        maxDate={calendarOptions.maxDate}
        onChange={(text) => {
          if (typeof text === 'string') changeInput('from', text);
        }}
      />
      <DateControl
        label={toLabel}
        value={value?.to ?? ''}
        disabled={disabled}
        readOnly={readOnly}
        minDate={calendarOptions.minDate}
        maxDate={calendarOptions.maxDate}
        onChange={(text) => {
          if (typeof text === 'string') changeInput('to', text);
        }}
      />
      <Button
        ref={setAnchor}
        disabled={disabled || readOnly}
        aria-label={openLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setStart(undefined);
          if (value) {
            setFocused(value.from);
            setMonth(
              startOfDisplayMonth(value.from, calendarOptions.calendarSystem),
            );
          }
          setOpen(!open);
        }}
      >
        <SvgIcon svg={calendarIcon} />
      </Button>
      <Popover
        open={open}
        anchor={anchor}
        onClose={() => {
          setOpen(false);
          setStart(undefined);
        }}
        label={label}
      >
        <div id={id}>
          <Calendar
            {...calendarOptions}
            month={month}
            focusedDate={focused}
            selection={start ? orderCalendarRange(start, focused) : value}
            onMonthChange={setMonth}
            onFocusedDateChange={setFocused}
            onSelect={(date) => {
              if (!start) setStart(date);
              else {
                onChange(orderCalendarRange(start, date));
                setStart(undefined);
                setOpen(false);
                anchor?.focus();
              }
            }}
          />
        </div>
      </Popover>
    </div>
  );
}
