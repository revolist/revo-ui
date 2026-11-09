/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useId, useRef, useState } from 'preact/hooks';
import { Input } from '../native-control';
import { EditorActions } from '../editor-actions';
import { type MaskedInputOptions, type MaskedInputText } from './model';
import './style.scss';
import {
  handleMaskedBeforeInput,
  handleMaskedPaste,
  handleMaskedHistory,
  formatMaskedDraft,
  normalizeMaskedInput,
  parseMaskedDraft,
} from './edit';

export * from './model';
export * from './edit';

const defaultText: MaskedInputText = {
  required: 'Enter a value.',
  invalid: 'Use only the characters and separators specified by the mask.',
  incomplete: 'Complete every position in the mask.',
  configuration:
    'Configure a mask with 0, A, or * positions and valid escapes.',
  preview: 'Formatted value',
};

/** Fixed-slot identifier field with immutable separators and staged string saves. */
export function MaskedDraft({
  value,
  options,
  apply,
  cancel,
}: {
  value: unknown;
  options: MaskedInputOptions;
  apply: (value: string | null) => void;
  cancel: () => void;
}) {
  const [draft, setDraft] = useState(() =>
    formatMaskedDraft(String(value ?? ''), options),
  );
  const [attempted, setAttempted] = useState(false);
  const [composing, setComposing] = useState(false);
  const composition = useRef(false);
  const id = useId();
  const text = { ...defaultText, ...options.text };
  const parsed = parseMaskedDraft(draft, options);
  const showError =
    attempted || parsed.error === 'invalid' || parsed.error === 'configuration';
  const commit = () => {
    setAttempted(true);
    if (!composition.current && parsed.valid) apply(parsed.value);
  };
  return (
    <div
      class="rv-masked-draft"
      onKeyDown={(event) => {
        if (
          !composition.current &&
          event.target instanceof HTMLInputElement &&
          handleMaskedHistory(event.target, event)
        ) {
          setDraft(event.target.value);
          return;
        }
        if (
          event.key === 'Enter' &&
          (event.ctrlKey ||
            event.metaKey ||
            event.target instanceof HTMLInputElement) &&
          !event.isComposing &&
          !composition.current
        ) {
          event.preventDefault();
          commit();
        }
      }}
    >
      <Input
        type="text"
        value={draft}
        aria-label={options.label ?? 'Masked identifier'}
        aria-invalid={showError && !parsed.valid}
        aria-describedby={`${id}-hint${showError && parsed.error ? ` ${id}-error` : ''}`}
        required={options.required}
        placeholder={options.placeholder ?? options.mask}
        onBeforeInput={(event) => {
          if (
            !composition.current &&
            handleMaskedBeforeInput(
              event.currentTarget,
              event as InputEvent,
              options,
            )
          )
            setDraft(event.currentTarget.value);
        }}
        onPaste={(event) => {
          if (
            !composition.current &&
            handleMaskedPaste(event.currentTarget, event, options)
          )
            setDraft(event.currentTarget.value);
        }}
        onInput={(event) => {
          if (!composition.current)
            normalizeMaskedInput(event.currentTarget, options);
          setDraft(event.currentTarget.value);
        }}
        onCompositionStart={() => {
          composition.current = true;
          setComposing(true);
        }}
        onCompositionEnd={(event) => {
          composition.current = false;
          setComposing(false);
          normalizeMaskedInput(event.currentTarget, options);
          setDraft(event.currentTarget.value);
        }}
      />
      <span id={`${id}-hint`} class="rv-masked-draft__preview">
        {text.preview}: <output>{parsed.formatted ?? options.mask}</output>
      </span>
      {showError && parsed.error && (
        <span id={`${id}-error`} role="alert" class="rv-editor-error">
          {text[parsed.error]}
        </span>
      )}
      <EditorActions
        text={options.actions}
        disabled={!parsed.valid || composing}
        apply={commit}
        cancel={cancel}
        clear={
          options.required
            ? undefined
            : () => setDraft(formatMaskedDraft('', options))
        }
      />
    </div>
  );
}
