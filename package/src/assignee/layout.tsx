/** @jsxImportSource preact */
import type { ComponentChildren, RefObject } from 'preact';
import { SearchInput } from '../search-input';
import { EditorActions } from '../editor-actions';
import { Alert } from '../controls';
import { validAssigneeUnits } from './model';
import type { AssigneePickerProps } from './types';

/** Renderer-neutral search, validation and actions around a specialized resource list. */
export function AssigneePickerLayout({
  query,
  onQueryChange,
  searchRef,
  children,
  ...props
}: AssigneePickerProps & {
  query: string;
  onQueryChange: (value: string) => void;
  searchRef?: RefObject<HTMLInputElement>;
  children: ComponentChildren;
}) {
  return (
    <div
      id={props.id}
      class="rv-assignee-picker"
      role="dialog"
      aria-label={props.text?.dialogLabel ?? 'Assign people'}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          if (props.value.every((item) => validAssigneeUnits(item.units)))
            props.apply();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          props.cancel();
        }
      }}
    >
      <div class="rv-assignee-picker__search">
        <SearchInput
          inputRef={searchRef}
          autoFocus
          aria-label={props.text?.searchLabel ?? 'Search assignees'}
          placeholder={props.text?.searchPlaceholder ?? 'Search name or role…'}
          value={query}
          onValueChange={onQueryChange}
        />
      </div>
      {children}
      {!props.options.some((option) =>
        `${option.name ?? ''} ${option.label} ${option.role ?? ''}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      ) && <p role="status">{props.text?.empty ?? 'No assignees found'}</p>}
      <div class="rv-assignee-picker__footer">
        <span aria-live="polite">
          {props.text?.selected?.(props.value.length) ??
            `${props.value.length} selected`}
        </span>
        <EditorActions
          showConfirm={props.showActions ?? props.autoApply === false}
          apply={props.apply}
          cancel={props.cancel}
          disabled={props.value.some((item) => !validAssigneeUnits(item.units))}
          text={{
            apply: props.text?.apply ?? 'Save',
            cancel: props.text?.cancel ?? 'Cancel',
          }}
        />
      </div>
      {props.value.some((item) => !validAssigneeUnits(item.units)) && (
        <Alert tone="danger">
          {props.text?.invalidUnits ?? 'Units must be a non-negative number.'}
        </Alert>
      )}
    </div>
  );
}
