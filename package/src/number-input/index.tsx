/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useEffect, useRef, useState } from 'preact/hooks';
import { Input } from '../native-control';
import { Button } from '../controls';
import { EditorActions } from '../editor-actions';
import { createControlId } from '../core/control-id';
import {
  defaultNumberInputText,
  formatNumberDraft,
  parseNumberInput,
  stepNumberInput,
  type NumberInputOptions,
} from './model';
import './style.scss';

export {
  formatNumberValue,
  formatNumberDraft,
  parseNumberInput,
  stepNumberInput,
} from './model';
export type {
  NumberInputOptions,
  NumberInputResult,
  NumberInputText,
} from './model';

/** Staged numeric input shared by number, currency and ratio editor adapters. */
export function NumberDraft({
  value,
  options,
  apply,
  cancel,
  initialSelection = 'all',
}: {
  value: unknown;
  options: NumberInputOptions;
  apply: (value: number | null) => void;
  cancel: () => void;
  /** Printable-key editors keep the initiating character and continue at its end. */
  initialSelection?: 'all' | 'end';
}) {
  const initial = () => {
    try {
      return formatNumberDraft(value, options);
    } catch {
      return String(value ?? '');
    }
  };
  const [draft, setDraft] = useState(initial);
  const [stepError, setStepError] = useState('');
  const [id] = useState(() => createControlId('rv-number'));
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const labels = { ...defaultNumberInputText, ...options.text };
  const parsed = parseNumberInput(draft, options);
  const error = parsed.error ?? stepError;
  const invalid = parsed.error !== undefined || Boolean(stepError);
  const commit = () => {
    if (composing.current) return;
    const result = parseNumberInput(draft, options);
    if (result.error === undefined && !stepError) apply(result.value);
  };
  const change = (text: string) => {
    setStepError('');
    setDraft(text);
  };
  const step = (direction: 1 | -1) => {
    if (composing.current) return;
    const next = stepNumberInput(draft, direction, options);
    if (next.error !== undefined) setStepError(next.error || labels.invalid);
    else {
      setStepError('');
      setDraft(formatNumberDraft(next.value, options));
    }
  };
  useEffect(() => {
    input.current?.focus();
    if (initialSelection === 'end') {
      const length = input.current?.value.length ?? 0;
      input.current?.setSelectionRange(length, length);
    } else input.current?.select();
  }, []);
  return (
    <div
      class="rv-number-draft"
      onKeyDown={(event) => {
        if (event.isComposing || composing.current) return;
        if (
          event.key === 'Enter' &&
          (event.target === input.current || event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
          commit();
        } else if (
          event.target === input.current &&
          ['ArrowUp', 'ArrowDown'].includes(event.key)
        ) {
          event.preventDefault();
          step(event.key === 'ArrowUp' ? 1 : -1);
        }
      }}
    >
      <label htmlFor={id}>
        {options.label ??
          (options.kind === 'currency'
            ? 'Currency amount'
            : options.kind === 'percent'
              ? 'Percentage'
              : 'Number')}
      </label>
      <div class="rv-number-draft__entry">
        <Input
          ref={input}
          id={id}
          class="rv-control"
          type="text"
          inputMode="decimal"
          value={draft}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-error` : undefined}
          required={options.required}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onInput={(event) => change(event.currentTarget.value)}
        />
        <Button
          aria-label={labels.decrease}
          disabled={parsed.error !== undefined}
          onClick={() => step(-1)}
        >
          −
        </Button>
        <Button
          aria-label={labels.increase}
          disabled={parsed.error !== undefined}
          onClick={() => step(1)}
        >
          +
        </Button>
      </div>
      {invalid && (
        <p class="rv-editor-error" id={`${id}-error`} role="alert">
          {error || labels.invalid || defaultNumberInputText.invalid}
        </p>
      )}
      <EditorActions
        text={options.actions}
        apply={commit}
        cancel={cancel}
        disabled={invalid}
        clear={options.required ? undefined : () => change('')}
      />
    </div>
  );
}
