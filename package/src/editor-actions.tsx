/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { Button } from './controls';
export interface EditorCommitOptions {
  /** Apply completed edits automatically. Set false to require explicit Apply. */
  autoApply?: boolean;
  /** Show Apply/Cancel buttons. Defaults to true only when autoApply is false. */
  showActions?: boolean;
}
export interface EditorActionText {
  apply: string;
  cancel: string;
  clear: string;
}
export const defaultEditorActionText: EditorActionText = {
  apply: 'Apply',
  cancel: 'Cancel',
  clear: 'Clear',
};
export function EditorActions({
  apply,
  cancel,
  clear,
  disabled,
  text = defaultEditorActionText,
  showConfirm = true,
}: {
  apply: () => void;
  cancel: () => void;
  clear?: () => void;
  disabled?: boolean;
  text?: Partial<EditorActionText>;
  showConfirm?: boolean;
}) {
  if (!showConfirm && !clear) return null;
  const labels = {
    apply: text.apply ?? defaultEditorActionText.apply,
    cancel: text.cancel ?? defaultEditorActionText.cancel,
    clear: text.clear ?? defaultEditorActionText.clear,
  };
  return (
    <div class="rv-editor-actions">
      {clear && (
        <Button
          variant="ghost"
          className="rv-editor-actions__clear"
          onClick={clear}
        >
          {labels.clear}
        </Button>
      )}
      {showConfirm && (
        <>
          <Button onClick={cancel}>{labels.cancel}</Button>
          <Button variant="primary" disabled={disabled} onClick={apply}>
            {labels.apply}
          </Button>
        </>
      )}
    </div>
  );
}
