/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Input } from '../native-control';
import { Alert, Button } from '../controls';
import { SvgIcon } from '../icons/icon';
import calendarIcon from '@fortawesome/fontawesome-free/svgs/regular/calendar.svg?raw';
import clockIcon from '@fortawesome/fontawesome-free/svgs/regular/clock.svg?raw';
import { mountEditorPopup, type EditorPopupHandle } from '../core/editor-popup';
import { EditorActions } from '../editor-actions';
import { useEditorAutoApply } from '../core/editor-commit';
import { TemporalPicker } from './picker';
import {
  temporalPickerLabel,
  type DateTimeFieldProps,
  type TemporalPickerOptions,
} from './types';
import type { TemporalControlValue } from '@revolist/dates';

export function TemporalDraft({
  value,
  options,
  apply,
  cancel,
  onValidChange,
  clearable = true,
}: {
  clearable?: boolean;
  value: TemporalControlValue;
  options: TemporalPickerOptions;
  apply: (value: TemporalControlValue) => void | string;
  cancel: () => void;
  /** Receives each valid temporal draft value before it is applied. */
  onValidChange?: (value: TemporalControlValue) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [valid, setValid] = useState(false);
  const [error, setError] = useState('');
  const change = (next: TemporalControlValue) => {
    setDraft(next);
    setError('');
  };
  const autoApply = options.autoApply !== false;
  const changed = JSON.stringify(draft) !== JSON.stringify(value);
  const commitValue = (next: TemporalControlValue) => {
    const message = apply(next) || '';
    setError(message);
    return !message;
  };
  const commit = () => (valid ? commitValue(draft) : false);
  useEditorAutoApply(() => (changed ? commit() : true), autoApply);
  return (
    <div
      class={`rv-temporal-draft${options.kind === 'time' ? ' rv-temporal-draft--time' : ''}`}
      onKeyDown={(event) => {
        if (
          event.key === 'Enter' &&
          !event.isComposing &&
          (event.ctrlKey ||
            event.metaKey ||
            (autoApply && event.target instanceof HTMLInputElement))
        ) {
          event.preventDefault();
          commit();
        }
      }}
    >
      <TemporalPicker
        {...options}
        value={draft}
        onChange={change}
        onValidChange={onValidChange}
        onValidityChange={setValid}
        onSelectionComplete={autoApply ? commitValue : undefined}
      />
      {error && <Alert tone="danger">{error}</Alert>}
      <EditorActions
        text={options.actions}
        showConfirm={options.showActions ?? !autoApply}
        disabled={!valid}
        apply={commit}
        cancel={cancel}
        clear={
          !clearable || (options.required ?? options.calendar?.required)
            ? undefined
            : () => {
                const empty = options.selection === 'multiple' ? [] : null;
                change(empty);
                if (autoApply) commitValue(empty);
              }
        }
      />
    </div>
  );
}
/** Native text entry plus the original shared CalendarPicker, usable in any product form. */
export function DateTimeField({
  value,
  kind = 'date',
  picker,
  livePickerUpdates,
  onValueChange,
  onInput,
  formatValue,
  parseValue,
  ...input
}: DateTimeFieldProps) {
  const anchor = useRef<HTMLButtonElement>(null);
  const popup = useRef<EditorPopupHandle>();
  const current = useRef({ value, kind, picker, onValueChange, input });
  current.current = { value, kind, picker, onValueChange, input };
  useLayoutEffect(() => () => popup.current?.close(), []);
  useLayoutEffect(() => {
    if (input.disabled || input.readOnly) popup.current?.close();
  }, [input.disabled, input.readOnly]);
  return (
    <span class="rv-date-time-field">
      <Input
        {...input}
        type="text"
        value={formatValue?.(value) ?? value}
        placeholder={
          input.placeholder ??
          (kind === 'date'
            ? 'YYYY-MM-DD'
            : kind === 'time'
              ? 'HH:mm'
              : 'YYYY-MM-DDTHH:mm')
        }
        onInput={(event) => {
          onInput?.(event);
          const next = parseValue
            ? parseValue(event.currentTarget.value)
            : event.currentTarget.value;
          if (next !== undefined) onValueChange?.(next);
        }}
      />
      <Button
        ref={anchor}
        variant="ghost"
        aria-label={temporalPickerLabel(kind, picker?.text)}
        disabled={input.disabled || input.readOnly}
        onClick={() => {
          if (!anchor.current) return;
          if (popup.current) {
            popup.current.close();
            return;
          }
          let lastApplied: string | undefined;
          const apply = (next: TemporalControlValue) => {
            const value = typeof next === 'string' ? next : '';
            if (
              value === lastApplied ||
              current.current.input.disabled ||
              current.current.input.readOnly
            )
              return;
            lastApplied = value;
            current.current.onValueChange?.(value);
          };
          popup.current = mountEditorPopup(
            anchor.current,
            (close) => (
              <TemporalDraft
                value={value || null}
                options={{
                  ...picker,
                  // Keep the anchored popup the same height across months.
                  calendar: {
                    fixedWeeks: true,
                    ...picker?.calendar,
                  },
                  required: picker?.required ?? input.required,
                  kind,
                  selection: 'single',
                }}
                cancel={close}
                onValidChange={
                  livePickerUpdates && picker?.autoApply !== false
                    ? apply
                    : undefined
                }
                apply={(next) => {
                  apply(next);
                  close();
                }}
              />
            ),
            {
              label: temporalPickerLabel(kind, picker?.text),
              fitViewport: kind === 'datetime',
              className:
                kind === 'time'
                  ? 'rv-editor-popup--time'
                  : kind === 'datetime'
                    ? 'rv-editor-popup--datetime'
                    : undefined,
              onClose: () => {
                popup.current = undefined;
              },
            },
          );
        }}
      >
        <SvgIcon svg={kind === 'time' ? clockIcon : calendarIcon} />
      </Button>
    </span>
  );
}
