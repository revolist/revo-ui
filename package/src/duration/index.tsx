/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useEffect, useRef, useState } from 'preact/hooks';
import { Input } from '../native-control';
import { DurationControls } from './controls';
import './style.scss';
import { EditorActions, type EditorCommitOptions } from '../editor-actions';
import { useEditorAutoApply } from '../core/editor-commit';
import {
  formatDurationValue,
  parseDurationControl,
  type DurationControlOptions,
  type ParsedDuration,
  type DurationUnit,
} from '@revolist/dates';

export interface DurationSliderOptions {
  /** Slider upper limit; the duration's max validation bound takes precedence. */
  max?: number;
  step?: number;
}
export interface DurationFieldOptions
  extends DurationControlOptions, EditorCommitOptions {
  slider?: boolean | DurationSliderOptions;
  unitButtons?: boolean;
  unitLabels?: Partial<Record<DurationUnit, string>>;
  unitLabel?: string;
  /** Override the input hint, independently of the configured default unit. */
  placeholder?: string;
  modeLabel?: string;
  workingLabel?: string;
  elapsedLabel?: string;
}
export interface DurationFieldProps extends DurationFieldOptions {
  value: ParsedDuration | string | number | null;
  onChange: (value: ParsedDuration | null) => void;
  /** A completed slider or unit/mode interaction, distinct from text entry. */
  onCommit?: (value: ParsedDuration | null) => void;
  onValidityChange?: (valid: boolean) => void;
  /** Product forms can keep raw invalid drafts for their existing error/commit pipeline. */
  onDraftChange?: (text: string) => void;
  label?: string;
  invalidText?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
}
export function DurationField(props: DurationFieldProps) {
  const format = (value: DurationFieldProps['value']) =>
    value && typeof value === 'object'
      ? formatDurationValue(value.value, value.unit, {
          elapsed: value.elapsed,
          maximumFractionDigits: props.maximumFractionDigits ?? 10,
        })
      : value === null
        ? ''
        : String(value);
  const [selectedUnit, setSelectedUnit] = useState<DurationUnit>(
    () =>
      parseDurationControl(props.value, props).value?.unit ?? props.defaultUnit,
  );
  const [draft, setDraft] = useState(() => format(props.value));
  const expected = useRef<DurationFieldProps['value']>(props.value);
  useEffect(() => {
    if (props.value !== expected.current) {
      expected.current = props.value;
      setDraft(format(props.value));
      setSelectedUnit(
        parseDurationControl(props.value, props).value?.unit ??
          props.defaultUnit,
      );
    }
  }, [props.value]);
  const options = {
    ...props,
    defaultUnit: props.unitButtons ? selectedUnit : props.defaultUnit,
  };
  const parsed = parseDurationControl(draft, options);
  useEffect(() => props.onValidityChange?.(parsed.valid), [parsed.valid]);
  const disabled = props.disabled || props.readOnly;
  const current = parsed.value;
  const unit = current?.unit ?? selectedUnit;
  const amount = current?.value ?? 0;
  const emitText = (text: string) => {
    setDraft(text);
    props.onDraftChange?.(text);
    const next = parseDurationControl(text, options);
    if (next.valid) {
      if (next.value) setSelectedUnit(next.value.unit);
      expected.current = next.value;
      props.onChange(next.value);
    }
  };
  const change = (
    value: number,
    nextUnit = unit,
    elapsed = current?.elapsed ?? false,
    commit = false,
  ) => {
    if (disabled) return;
    const text = formatDurationValue(value, nextUnit, {
      elapsed,
      maximumFractionDigits: props.maximumFractionDigits ?? 10,
    });
    emitText(text);
    const next = parseDurationControl(text, options);
    if (commit && next.valid) props.onCommit?.(next.value);
  };
  return (
    <span class={`rv-duration-field ${props.className ?? ''}`}>
      <Input
        type="text"
        aria-label={props.label ?? 'Duration'}
        aria-invalid={!parsed.valid}
        value={draft}
        disabled={props.disabled}
        readOnly={props.readOnly}
        placeholder={
          props.placeholder ??
          `2 ${props.unitLabels?.[props.defaultUnit] ?? props.defaultUnit}`
        }
        onInput={(event) => emitText(event.currentTarget.value)}
      />
      <DurationControls
        {...props}
        unit={unit}
        amount={amount}
        draft={draft}
        elapsed={current?.elapsed ?? false}
        disabled={disabled || (!parsed.valid && !!draft.trim())}
        onChange={change}
        onCommit={(value, nextUnit, elapsed) =>
          change(value, nextUnit, elapsed, true)
        }
      />
      {!parsed.valid && (
        <span role="alert" class="rv-editor-error">
          {props.invalidText ??
            'Enter a valid duration within the allowed units and bounds.'}
        </span>
      )}
    </span>
  );
}
export type { DurationControlOptions, ParsedDuration };

/** Shared staged duration form for grid adapters; scheduling stays in product commands. */
export function DurationDraft({
  value,
  options,
  apply,
  cancel,
}: {
  value: DurationFieldProps['value'];
  options: DurationFieldOptions & {
    label?: string;
    invalidText?: string;
    actions?: Partial<import('../editor-actions').EditorActionText>;
  };
  apply: (value: ParsedDuration | null) => void;
  cancel: () => void;
}) {
  const [valid, setValid] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);
  const [reset, setReset] = useState(0);
  const autoApply = options.autoApply !== false;
  const dirty = useRef(false);
  const raw = useRef(value);
  const commit = (force = false) => {
    const next = parseDurationControl(raw.current, options);
    if (!next.valid) return false;
    if (force || !autoApply || dirty.current) {
      dirty.current = false;
      apply(next.value);
    }
    return true;
  };
  useEditorAutoApply(commit, autoApply);
  return (
    <div
      onKeyDown={(event) => {
        const textInput =
          event.target instanceof HTMLInputElement &&
          event.target.type === 'text';
        if (
          !event.isComposing &&
          event.key === 'Enter' &&
          ((autoApply && textInput) || event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
          commit(true);
        }
      }}
    >
      <DurationField
        key={reset}
        {...options}
        value={fieldValue}
        onChange={(next) => {
          dirty.current = true;
          setFieldValue(next);
        }}
        onDraftChange={(text) => {
          dirty.current = true;
          raw.current = text;
        }}
        onValidityChange={setValid}
      />
      <EditorActions
        showConfirm={options.showActions ?? !autoApply}
        text={options.actions}
        disabled={!valid}
        apply={() => commit(true)}
        cancel={cancel}
        clear={
          options.required
            ? undefined
            : () => {
                if (autoApply) {
                  apply(null);
                  return;
                }
                raw.current = null;
                setFieldValue(null);
                setReset((previous) => previous + 1);
              }
        }
      />
    </div>
  );
}
