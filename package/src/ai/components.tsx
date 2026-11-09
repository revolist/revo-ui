import { AiTranslationProvider, useAiText } from './translation-context';
import { translateAiText, type AiUiTranslations } from './translations';
import {
  h,
  Fragment,
  type ComponentChildren,
  type ComponentProps,
} from 'preact';
import { useRef, useEffect, useLayoutEffect } from 'preact/hooks';
import { AiPromptRecall, boundAiPromptHistory } from './prompt-history';
import { Button, IconButton, Textarea, Spinner } from '../controls';
import { createControlId } from '../core/control-id';
import { Dropdown } from '../dropdown';
import { SvgIcon } from '../icons';
import ellipsisIcon from '@fortawesome/fontawesome-free/svgs/solid/ellipsis.svg?raw';
import arrowUpIcon from '@fortawesome/fontawesome-free/svgs/solid/arrow-up.svg?raw';
import stopIcon from '@fortawesome/fontawesome-free/svgs/solid/stop.svg?raw';

export type AiActionPhase =
  | 'idle'
  | 'understanding'
  | 'applying'
  | 'preview'
  | 'completed'
  | 'clarification'
  | 'unsupported'
  | 'error'
  | 'cancelled';
export interface AiPromptInputProps {
  translations?: AiUiTranslations;
  value: string;
  onValueChange(value: string): void;
  onSubmit(value: string): void;
  onStop?(): void;
  busy?: boolean;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  submitLabel?: string;
  stopLabel?: string;
  /** Opt-in local prompt recall. Arrow keys retain normal multiline behavior away from text edges. */
  promptHistory?: readonly string[];
  /** Empty-draft keyboard guidance. An empty string lets toolbar context replace it. */
  hint?: string;
  /** Host-supported actions or context, displayed in the composer toolbar. */
  actions?: ComponentChildren;
  /** Applied context or supplemental content above the bottom toolbar. */
  footer?: ComponentChildren;
  /** Native textarea presentation and sizing; input behavior stays controlled here. */
  textareaProps?: Pick<
    ComponentProps<typeof Textarea>,
    'className' | 'style' | 'rows'
  >;
}

/** Shared composer: Enter submits, Shift+Enter inserts a line; IME never submits. */
export function AiPromptInput({
  translations,
  value,
  onValueChange,
  onSubmit,
  onStop,
  busy = false,
  disabled = false,
  label = 'Ask AI to change this view',
  placeholder = 'Filter or sort your data…',
  submitLabel = 'Send',
  stopLabel = 'Stop',
  promptHistory,
  hint = '',
  actions,
  footer,
  textareaProps,
}: AiPromptInputProps) {
  const t = useAiText(translations);
  const id = useRef(createControlId('ai-prompt'));
  const composing = useRef(false);
  const recall = useRef(new AiPromptRecall());
  const recalledCaret = useRef<{
    element: HTMLTextAreaElement;
    position: number;
  }>();
  useLayoutEffect(() => {
    if (!recalledCaret.current) return;
    const { element, position } = recalledCaret.current;
    element.setSelectionRange(position, position);
    recalledCaret.current = undefined;
  });
  const hintId = `${id.current}-hint`;
  const showHint = !!hint && !value.length;
  const canStop = busy && !!onStop;
  const submit = () => {
    if (!disabled && !busy && value.trim()) onSubmit(value.trim());
  };
  return (
    <form
      class="rv-ai-prompt"
      aria-busy={busy || undefined}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <label for={id.current} class="rv-ai-prompt-label rv-visually-hidden">
        {t(label)}
      </label>
      <div class="rv-ai-prompt-composer">
        <Textarea
          rows={1}
          {...textareaProps}
          id={id.current}
          aria-describedby={showHint ? hintId : undefined}
          value={value}
          onValueChange={(next) => {
            recall.current.reset();
            recalledCaret.current = undefined;
            onValueChange(next);
          }}
          placeholder={t(placeholder)}
          disabled={disabled || busy}
          maxLength={4000}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(event) => {
            const input = event.currentTarget;
            if (
              promptHistory &&
              !busy &&
              !disabled &&
              !composing.current &&
              !event.isComposing &&
              event.keyCode !== 229 &&
              !event.altKey &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey &&
              input.selectionStart === input.selectionEnd &&
              ((event.key === 'ArrowUp' &&
                !value.slice(0, input.selectionStart).includes('\n')) ||
                (event.key === 'ArrowDown' &&
                  !value.slice(input.selectionEnd).includes('\n')))
            ) {
              const next = recall.current.move(
                value,
                event.key === 'ArrowUp' ? 'up' : 'down',
                boundAiPromptHistory(promptHistory),
              );
              if (next !== undefined) {
                event.preventDefault();
                if (next === value) return;
                recalledCaret.current = {
                  element: input,
                  position: next.length,
                };
                onValueChange(next);
                return;
              }
            }
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.isComposing &&
              !composing.current &&
              event.keyCode !== 229
            ) {
              event.preventDefault();
              submit();
            }
          }}
        />
        {footer && <div class="rv-ai-prompt-footer">{footer}</div>}
        <div class="rv-ai-prompt-toolbar">
          <div class="rv-ai-prompt-tools">
            {actions}
            {showHint && (
              <span id={hintId} class="rv-ai-prompt-hint">
                {t(hint)}
              </span>
            )}
          </div>
          <IconButton
            className="rv-ai-prompt-submit"
            type={canStop ? 'button' : 'submit'}
            label={t(canStop ? stopLabel : submitLabel)}
            icon={canStop ? stopIcon : arrowUpIcon}
            onClick={
              canStop
                ? (event) => {
                    // Stop can synchronously become a submit button after cancellation.
                    event.preventDefault();
                    onStop?.();
                  }
                : undefined
            }
            disabled={disabled || (!canStop && !value.trim())}
            busy={busy && !canStop}
            variant="solid"
            size="compact"
          />
        </div>
      </div>
    </form>
  );
}

export interface AiSuggestionChoice {
  label: string;
  prompt: string;
}
export interface AiSuggestionsProps {
  /** Number of inline choices; remaining choices are available under More. Default: 2. */
  maxVisible?: number;
  translations?: AiUiTranslations;
  items: readonly (string | AiSuggestionChoice)[];
  onSelect(value: string): void;
  disabled?: boolean;
  label?: string;
}
export function AiSuggestions({
  translations,
  items,
  onSelect,
  disabled,
  label = 'Suggested requests',
  maxVisible = 2,
}: AiSuggestionsProps) {
  const t = useAiText(translations);
  if (!items.length) return null;
  const visible = Number.isFinite(maxVisible)
    ? Math.max(0, Math.floor(maxVisible))
    : 2;
  const choices = items.map((item) =>
    typeof item === 'string' ? { label: item, prompt: item } : item,
  );
  return (
    <div class="rv-ai-suggestions" role="group" aria-label={t(label)}>
      {choices.slice(0, visible).map((item, index) => (
        <Button
          key={`${index}:${item.prompt}`}
          className="rv-ai-suggestion"
          size="compact"
          disabled={disabled}
          onClick={() => onSelect(item.prompt)}
        >
          {item.label}
        </Button>
      ))}
      {choices.length > visible && (
        <Dropdown<string>
          className="rv-ai-examples"
          source={choices
            .slice(visible)
            .map((item) => ({ value: item.prompt, label: item.label }))}
          disabled={disabled}
          placeholder={t('More')}
          renderSelectedValue={() => <SvgIcon svg={ellipsisIcon} size={14} />}
          config={{
            ariaLabel: t('More'),
            search: true,
            searchPlaceholder: t('Search requests'),
            searchAriaLabel: t('Search requests'),
            popupClassName: 'rv-ai-examples-menu',
            maxHeight: 480,
          }}
          onChange={(value) => {
            if (typeof value === 'string') onSelect(value);
          }}
        />
      )}
    </div>
  );
}

export interface AiActionStatusProps {
  translations?: AiUiTranslations;
  phase: AiActionPhase;
  message: string;
}
export function AiActionStatus({
  translations,
  phase,
  message,
}: AiActionStatusProps) {
  const t = useAiText(translations);
  return (
    <div
      class="rv-ai-status"
      data-state={phase}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {(phase === 'understanding' || phase === 'applying') && (
        <span aria-hidden="true">
          <Spinner label="" />
        </span>
      )}
      <span>{t(message)}</span>
    </div>
  );
}

export interface AiResultProps {
  translations?: AiUiTranslations;
  summary: string;
  matchedRows?: number;
  countLabel?: (count: number) => string;
  actions?: ComponentChildren;
  children?: ComponentChildren;
}
export function AiResult({
  translations,
  summary,
  matchedRows,
  countLabel,
  actions,
  children,
}: AiResultProps) {
  const t = useAiText(translations);
  return (
    <div class="rv-ai-result" role="status" aria-live="polite">
      <p class="rv-ai-result-summary">{summary}</p>
      {matchedRows !== undefined && (
        <p class="rv-ai-result-count">
          {countLabel
            ? countLabel(matchedRows)
            : t('{count} matching rows', {
                count: matchedRows.toLocaleString(),
              })}
        </p>
      )}
      {children}
      {actions && <div class="rv-ai-result-actions">{actions}</div>}
    </div>
  );
}

export interface AiAssistantProps {
  /** Fill a bounded parent, with messages scrolling above the composer. */
  layout?: 'flow' | 'fill';
  translations?: AiUiTranslations;
  label?: string;
  children?: ComponentChildren;
  footer?: ComponentChildren;
  busy?: boolean;
}
/** Neutral composition; grid/model/query policy remains in the consuming product. */
export function AiAssistant({
  layout = 'flow',
  translations = {},
  label = 'AI view assistant',
  children,
  footer,
  busy,
}: AiAssistantProps) {
  const t = (text: string) => translateAiText(text, translations);
  return (
    <AiTranslationProvider translations={translations}>
      <section
        class={`rv-ai-assistant${layout === 'fill' ? ' rv-ai-assistant--fill' : ''}`}
        aria-label={t(label)}
        aria-busy={busy || undefined}
        onKeyDown={(event) => event.stopPropagation()}
        onKeyUp={(event) => event.stopPropagation()}
      >
        {children}
        {footer && <div class="rv-ai-assistant-footer">{footer}</div>}
      </section>
    </AiTranslationProvider>
  );
}

export interface AiPreviewChange {
  /** User-facing record, task or chart name. */
  item?: string;
  label: string;
  before?: string;
  after?: string;
}
export interface AiChangePreviewProps {
  translations?: AiUiTranslations;
  summary: string;
  details?: string;
  changes?: readonly AiPreviewChange[];
  notice?: string;
  disabled?: boolean;
  onApply(): void;
  onCancel(): void;
}
/** Generic approval surface; the host retains the prepared command and its mutation policy. */
export function AiChangePreview({
  translations,
  summary,
  details,
  changes,
  notice,
  disabled,
  onApply,
  onCancel,
}: AiChangePreviewProps) {
  const t = useAiText(translations);
  const apply = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    apply.current?.focus();
  }, []);
  return (
    <section
      class="rv-ai-change-preview"
      aria-label={t('Review changes')}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !disabled) {
          event.preventDefault();
          onCancel();
        }
      }}
    >
      <AiResult
        summary={summary}
        actions={
          <>
            <Button ref={apply} disabled={disabled} onClick={onApply}>
              {t('Apply changes')}
            </Button>
            <Button disabled={disabled} variant="ghost" onClick={onCancel}>
              {t('Cancel changes')}
            </Button>
          </>
        }
      >
        {notice && <p class="rv-ai-preview-notice">{notice}</p>}
        {changes?.length ? (
          <div
            class="rv-ai-preview-changes"
            role="region"
            aria-label={t('Proposed changes')}
            tabIndex={0}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">{t('Change')}</th>
                  <th scope="col">{t('Current')}</th>
                  <th scope="col">{t('Proposed')}</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((change, index) => (
                  <tr key={index}>
                    <th scope="row">
                      {change.item && (
                        <span class="rv-ai-preview-item">{change.item}</span>
                      )}
                      {change.label}
                    </th>
                    <td>{change.before ?? '—'}</td>
                    <td>{change.after ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          details && <pre class="rv-ai-result-details">{details}</pre>
        )}
      </AiResult>
    </section>
  );
}
