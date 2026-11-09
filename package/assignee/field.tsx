/** @jsxImportSource preact */
import type { ComponentChildren } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { Dropdown } from '../dropdown';
import type { DropdownProps } from '../dropdown/dropdown.types';
import {
  copyAssigneeAssignments,
  validAssigneeUnits,
  formatAssigneeLabel,
  type AssigneeAssignment,
  type AssigneeId,
} from './model';
import { AssigneePicker } from './picker';
import type {
  AssigneeFieldOptions,
  AssigneePickerProps,
  AssigneeOption,
} from './types';
import './assignee.scss';

export function AssigneeField({
  value,
  options,
  theme,
  renderPicker,
  renderValue,
  save,
  cancel,
}: {
  value: unknown;
  options: AssigneeFieldOptions;
  theme?: string;
  renderPicker?: (props: AssigneePickerProps) => ComponentChildren;
  renderValue?: (
    h: Parameters<NonNullable<DropdownProps<AssigneeId>['renderValue']>>[0],
    option: AssigneeOption,
    units: number,
  ) => any;
  save: (value: AssigneeAssignment[]) => void;
  cancel: () => void;
}) {
  const [draft, setDraft] = useState(() => copyAssigneeAssignments(value));
  const current = useRef(draft);
  const applied = useRef(false);
  const updateDraft = (next: AssigneeAssignment[]) => {
    current.current = next;
    setDraft(next);
  };
  const apply = () => {
    if (!current.current.every((item) => validAssigneeUnits(item.units)))
      return false;
    applied.current = true;
    save(current.current);
    return true;
  };
  const autoApply = options.autoApply !== false;
  const known = new Map(options.source.map((option) => [option.value, option]));
  const source = [
    ...options.source,
    ...draft
      .filter((item) => !known.has(item.value))
      .map((item) => ({ value: item.value, label: String(item.value) })),
  ];
  const defaultUnits = validAssigneeUnits(options.defaultUnits ?? 100)
    ? (options.defaultUnits ?? 100)
    : 100;
  return (
    <Dropdown
      source={source}
      value={draft.map((item) => item.value)}
      className="rv-assignee-editor"
      placeholder={options.text?.placeholder ?? 'Assign people…'}
      config={{
        multiSelect: true,
        autoOpen: true,
        autoFocus: true,
        topLayer: true,
        ariaLabel: options.text?.label ?? 'Assignees',
        removeLabel: options.text?.removeLabel,
        popupClassName: 'rv-assignee-picker-menu edit-input-wrapper',
        theme,
      }}
      renderValue={(h, option) => {
        const units =
          draft.find((item) => item.value === option.value)?.units ?? 0;
        return renderValue
          ? renderValue(h, option, units)
          : formatAssigneeLabel(option.name ?? option.label, units);
      }}
      onChange={(values) => {
        const selected = new Set(Array.isArray(values) ? values : [values]);
        updateDraft(current.current.filter((item) => selected.has(item.value)));
      }}
      beforeOutsideClose={
        autoApply
          ? () => {
              if (
                !current.current.every((item) => validAssigneeUnits(item.units))
              )
                return false;
              if (
                JSON.stringify(current.current) ===
                JSON.stringify(copyAssigneeAssignments(value))
              )
                return true;
              return apply();
            }
          : undefined
      }
      onClose={() => {
        if (!applied.current) cancel();
      }}
      renderContent={({ id, close }) => {
        const props: AssigneePickerProps = {
          id,
          options: options.source,
          value: draft,
          change: updateDraft,
          autoApply,
          showActions: options.showActions,
          theme,
          defaultUnits,
          showAvatars: options.showAvatars,
          text: options.text,
          apply,
          cancel: () => close(false),
        };
        return renderPicker ? (
          renderPicker(props)
        ) : (
          <AssigneePicker {...props} />
        );
      }}
    />
  );
}
