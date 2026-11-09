/** @jsxImportSource preact */
import { SharedResourcePicker } from '../resource-picker';
import { Input } from '../native-control';
import { EditorActions } from '../editor-actions';
import { reconcileAssigneeSelection, validAssigneeUnits } from './model';
import type { AssigneePickerProps } from './types';

/** Standalone allocation picker; grid consumers may supply a virtualized body. */
export function AssigneePicker(props: AssigneePickerProps) {
  const text = props.text;
  const valid = props.value.every((item) => validAssigneeUnits(item.units));
  return (
    <div
      id={props.id}
      class="rv-assignee-picker"
      role="dialog"
      aria-label={text?.dialogLabel ?? 'Assign people'}
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
      <SharedResourcePicker
        resources={props.options.map((option) => ({
          ...option,
          id: option.value,
          name: option.name ?? option.label,
        }))}
        selectedResourceIds={props.value.map((item) => item.value)}
        classNames={{
          avatar:
            props.showAvatars === false
              ? 'rv-assignee-avatar--hidden'
              : undefined,
        }}
        preserveOrder
        isResourceDisabled={(resource) => !!resource.disabled}
        text={{
          groupAriaLabel: text?.label ?? 'Assignees',
          searchAriaLabel: text?.searchLabel ?? 'Search assignees',
          searchPlaceholder: text?.searchPlaceholder ?? 'Search name or role…',
          emptySearch: text?.empty ?? 'No assignees found',
          emptyResources: text?.empty ?? 'No assignees found',
        }}
        onChange={(ids) =>
          props.change(
            reconcileAssigneeSelection(
              props.value,
              props.options,
              new Set(ids),
              props.defaultUnits,
            ),
          )
        }
      />
      <div class="rv-assignee-picker__allocations">
        {props.value.map((item) => {
          const option = props.options.find(
            (option) => option.value === item.value,
          );
          const name = option?.name ?? option?.label ?? String(item.value);
          return (
            <label key={`${typeof item.value}:${item.value}`}>
              <span>{name}</span>
              <Input
                type="number"
                min={0}
                step="any"
                disabled={option?.disabled}
                aria-label={text?.unitsLabel?.(name) ?? `Units for ${name}`}
                value={Number.isFinite(item.units) ? String(item.units) : ''}
                onInput={(event) =>
                  props.change(
                    props.value.map((assignment) =>
                      assignment.value === item.value
                        ? {
                            ...assignment,
                            units: event.currentTarget.valueAsNumber,
                          }
                        : assignment,
                    ),
                  )
                }
              />
            </label>
          );
        })}
      </div>
      <div class="rv-assignee-picker__footer">
        <span aria-live="polite">
          {text?.selected?.(props.value.length) ??
            `${props.value.length} selected`}
        </span>
        <EditorActions
          showConfirm={props.showActions ?? props.autoApply === false}
          apply={props.apply}
          cancel={props.cancel}
          disabled={!valid}
          text={{
            apply: text?.apply ?? 'Save',
            cancel: text?.cancel ?? 'Cancel',
          }}
        />
      </div>
      {!valid && (
        <p role="alert">
          {text?.invalidUnits ?? 'Units must be a non-negative number.'}
        </p>
      )}
    </div>
  );
}
