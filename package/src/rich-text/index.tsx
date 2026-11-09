/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { createControlId } from '../core/control-id';
import { Button } from '../controls';
import { Input } from '../native-control';
import { HighlightedTextInput } from '../filter-controls';
import { HtmlSyntax } from './syntax';
import { SegmentedSwitch } from '../segmented-switch';
import {
  EditorActions,
  type EditorActionText,
  type EditorCommitOptions,
} from '../editor-actions';
import { useEditorAutoApply } from '../core/editor-commit';
import {
  createHtmlEngine,
  emptyHtmlSelection,
  type HtmlEngine,
} from './engine';
import { HtmlToolbar } from './toolbar';
import { sanitizeRichTextHtml } from './model';
import { formatRichTextHtml } from './format-html';
import { defaultHtmlEditorText, type HtmlEditorText } from './translations';
import './style.scss';
export { defaultHtmlEditorText, type HtmlEditorText } from './translations';
export interface HtmlEditorProps extends EditorCommitOptions {
  /** Override formatRichTextHtml for source presentation on entry, never while typing. */
  formatSource?: (html: string) => string;
  value: string;
  onApply: (value: string) => void;
  onCancel: () => void;
  required?: boolean;
  maxLength?: number;
  text?: Partial<HtmlEditorText>;
  actions?: Partial<EditorActionText>;
}
export function HtmlEditor(props: HtmlEditorProps) {
  const [helpId] = useState(() => createControlId('rv-rich-text-help'));
  const savedValue = useRef(props.value);
  const text = { ...defaultHtmlEditorText, ...props.text };
  const initialHtml = useMemo(
    () => sanitizeRichTextHtml(props.value),
    [props.value],
  );
  const [draft, setDraft] = useState(initialHtml);
  const normalized = useMemo(() => sanitizeRichTextHtml(draft), [draft]);
  const [mode, setMode] = useState<'visual' | 'source'>('visual');
  const [error, setError] = useState('');
  const [selection, setSelection] = useState(emptyHtmlSelection);
  const [url, setUrl] = useState('');
  const [showLink, setShowLink] = useState(false);
  const dirty = useRef(false),
    root = useRef<HTMLDivElement>(null),
    engine = useRef<HtmlEngine>();
  const draftRef = useRef(draft);
  draftRef.current = draft;
  useEffect(() => {
    if (!root.current) return;
    engine.current = createHtmlEngine(
      root.current,
      draftRef.current,
      (value) => {
        dirty.current = true;
        draftRef.current = value;
        setDraft(value);
        setError('');
      },
      setSelection,
    );
    return () => {
      engine.current?.destroy();
      engine.current = undefined;
    };
  }, []);
  useEffect(() => {
    if (savedValue.current === props.value) return;
    savedValue.current = props.value;
    dirty.current = false;
    draftRef.current =
      mode === 'source'
        ? (props.formatSource ?? formatRichTextHtml)(initialHtml)
        : initialHtml;
    setDraft(draftRef.current);
    setError('');
    setShowLink(false);
    engine.current?.setHtml(initialHtml);
  }, [props.value, initialHtml]);
  const validate = (value: string) =>
    props.required && !value
      ? 'requiredValue'
      : props.maxLength !== undefined && value.length > props.maxLength
        ? 'tooLong'
        : undefined;
  const apply = () => {
    const value = sanitizeRichTextHtml(draftRef.current),
      issue = validate(value);
    if (issue) {
      setError(text[issue]);
      return false;
    }
    props.onApply(value);
    return true;
  };
  useEditorAutoApply(
    () => !dirty.current || draftRef.current === initialHtml || apply(),
    props.autoApply !== false,
  );
  const disabled = !!validate(normalized);
  return (
    <div
      class="rv-rich-text-editor"
      onKeyDown={(event) => {
        if (event.altKey && event.key === 'F10' && mode === 'visual') {
          event.preventDefault();
          event.stopPropagation();
          engine.current?.captureSelection();
          event.currentTarget
            .querySelector<SVGElement>(
              '[role="toolbar"] [role="button"][tabindex="0"]',
            )
            ?.focus();
        }
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === 'Enter' &&
          !event.isComposing
        ) {
          event.preventDefault();
          event.stopPropagation();
          apply();
        }
      }}
    >
      <SegmentedSwitch
        value={mode}
        ariaLabel={text.label}
        options={[
          { value: 'visual', label: text.visual },
          { value: 'source', label: text.source },
        ]}
        onChange={(next) => {
          if (next === 'visual') {
            const value = sanitizeRichTextHtml(draftRef.current);
            draftRef.current = value;
            setDraft(value);
            engine.current?.setHtml(value);
          } else {
            engine.current?.captureSelection();
            const value = (props.formatSource ?? formatRichTextHtml)(
              draftRef.current,
            );
            draftRef.current = value;
            setDraft(value);
          }
          setMode(next);
          setError('');
        }}
      />
      {mode === 'visual' && (
        <HtmlToolbar
          engine={() => engine.current}
          selection={selection}
          text={text}
          showLink={showLink}
          onLink={() => {
            engine.current?.captureSelection();
            setShowLink(!showLink);
          }}
        />
      )}
      {showLink && mode === 'visual' && (
        <div class="rv-rich-text-editor__link">
          <Input
            aria-label={text.linkUrl}
            value={url}
            onInput={(event) => setUrl(event.currentTarget.value)}
          />
          <Button
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              if (engine.current?.link(url)) {
                setShowLink(false);
                setError('');
              } else setError(text.unsafeLink);
            }}
          >
            {text.link}
          </Button>
        </div>
      )}
      <div
        ref={root}
        hidden={mode !== 'visual'}
        class="rv-rich-text-editor__visual"
        role="textbox"
        aria-label={text.label}
        aria-multiline="true"
        aria-describedby={helpId}
        aria-invalid={disabled || undefined}
        contentEditable
        onClick={(event) => {
          if ((event.target as Element).closest('a')) event.preventDefault();
        }}
      />
      {mode === 'visual' && (
        <p id={helpId} class="rv-rich-text-editor__help">
          {selection.block === 'code' ? text.codeHelp : text.keyboardHelp}
        </p>
      )}
      {mode === 'source' && (
        <HighlightedTextInput
          className="rv-rich-text-editor__source"
          aria-label={text.source}
          aria-invalid={disabled || undefined}
          value={draft}
          wrap="off"
          highlight={
            <>
              <HtmlSyntax code={draft} />
              {draft.endsWith('\n') ? ' ' : ''}
            </>
          }
          onInput={(event) => {
            dirty.current = true;
            draftRef.current = event.currentTarget.value;
            setDraft(event.currentTarget.value);
            setError('');
          }}
        />
      )}
      {error && (
        <p class="rv-editor-error" role="alert">
          {error}
        </p>
      )}
      <EditorActions
        showConfirm={props.showActions ?? props.autoApply === false}
        text={props.actions}
        disabled={disabled}
        cancel={props.onCancel}
        apply={apply}
        clear={
          props.required
            ? undefined
            : () => {
                dirty.current = true;
                draftRef.current = '';
                setDraft('');
                engine.current?.setHtml('');
                setError('');
                if (props.autoApply !== false) apply();
              }
        }
      />
    </div>
  );
}
export { sanitizeRichTextHtml, isSafeRichTextLink } from './model';
export { htmlRenderNodes, type HtmlRenderNode } from './render-model';

export { formatRichTextHtml } from './format-html';

export { HtmlSyntax } from './syntax';
