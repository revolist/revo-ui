/** @jsxImportSource preact */
import { useRef, useState } from 'preact/hooks';
import { Dropdown } from './index';
import type {
  DropdownDataSource,
  DropdownOption,
  DropdownRemoteText,
  LookupId,
} from './dropdown.types';
import {
  EditorActions,
  type EditorActionText,
  type EditorCommitOptions,
} from '../editor-actions';
import { useEditorAutoApply } from '../core/editor-commit';

export interface LookupFieldText extends Partial<DropdownRemoteText> {
  popupLabel?: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  removeLabel?: (label: string) => string;
  requiredValue?: string;
}
export interface LookupFieldOptions extends EditorCommitOptions {
  dataSource: DropdownDataSource<LookupId>;
  multiple?: boolean;
  placeholder?: string;
  required?: boolean;
  source?: DropdownOption<LookupId>[];
  text?: LookupFieldText;
  actions?: Partial<EditorActionText>;
  renderOption?: import('./dropdown.types').DropdownProps<LookupId>['renderOption'];
  renderValue?: import('./dropdown.types').DropdownProps<LookupId>['renderValue'];
}
export function LookupField({
  initial,
  options,
  context,
  apply,
  cancel,
}: {
  /** Initial selected record ID, multiple IDs, or null for an empty selection. */
  initial: LookupId | LookupId[] | null;
  /** Remote data source, selection mode, validation, text and commit behavior. */
  options: LookupFieldOptions;
  /** Application context forwarded to the remote data source as dataContext. */
  context: unknown;
  /** Commits the selected record IDs. Update application state and close the editor. */
  apply: (value: LookupId | LookupId[] | null) => void;
  /** Closes the editor without applying the current draft. */
  cancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [touched, setTouched] = useState(false);
  const autoApply = options.autoApply !== false;
  const dirty = useRef(false);
  const current = useRef(initial);
  const empty = draft === null || (Array.isArray(draft) && !draft.length);
  useEditorAutoApply(() => {
    if (!dirty.current) return true;
    const next = current.current;
    if (
      options.required &&
      (next === null || (Array.isArray(next) && !next.length))
    )
      return false;
    if (dirty.current) {
      dirty.current = false;
      apply(next);
    }
    return true;
  }, autoApply);
  return (
    <div
      class="rv-lookup-editor"
      onKeyDown={(event) => {
        if (
          (event.ctrlKey || event.metaKey) &&
          event.key === 'Enter' &&
          !(options.required && empty)
        ) {
          event.preventDefault();
          apply(draft);
        }
      }}
    >
      <Dropdown
        className="rv-select"
        source={options.source ?? []}
        dataSource={options.dataSource}
        dataContext={context}
        remoteText={options.text}
        value={draft === null ? undefined : draft}
        onChange={(next) => {
          dirty.current = true;
          setTouched(true);
          current.current = next;
          setDraft(next);
          const nextEmpty =
            next === null || (Array.isArray(next) && !next.length);
          if (
            autoApply &&
            !options.multiple &&
            !(options.required && nextEmpty)
          ) {
            dirty.current = false;
            apply(next);
          }
        }}
        placeholder={options.placeholder ?? options.text?.placeholder}
        renderOption={options.renderOption}
        renderValue={options.renderValue}
        config={{
          search: true,
          multiSelect: options.multiple,
          topLayer: true,
          autoFocus: true,
          ariaLabel: options.text?.label ?? 'Linked records',
          searchPlaceholder: options.text?.searchPlaceholder,
          searchAriaLabel: options.text?.searchLabel,
          removeLabel: options.text?.removeLabel,
        }}
      />
      {options.required && empty && touched && (
        <span role="alert" class="rv-editor-error">
          {options.text?.requiredValue ?? 'Select at least one record.'}
        </span>
      )}
      <EditorActions
        showConfirm={options.showActions ?? !autoApply}
        text={options.actions}
        disabled={options.required && empty}
        cancel={cancel}
        apply={() => apply(draft)}
        clear={
          options.required
            ? undefined
            : () => {
                const next = options.multiple ? [] : null;
                if (autoApply) apply(next);
                else {
                  current.current = next;
                  setDraft(next);
                }
              }
        }
      />
    </div>
  );
}
