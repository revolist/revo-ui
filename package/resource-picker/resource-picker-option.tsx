/** @jsxImportSource preact */
import { h } from 'preact';

import { ResourcePickerAvatar } from './resource-picker-avatar';
import type {
  ResourcePickerClassNames,
  ResourcePickerId,
  ResourcePickerItem,
} from './resource-picker.types';
import {
  resourcePickerClasses,
  resourcePickerDataAttribute,
  resourcePickerIdKey,
  uniqueResourcePickerIds,
} from './resource-picker.utils';

export interface ResourcePickerOptionProps<
  Id extends ResourcePickerId,
  Resource extends ResourcePickerItem<Id>,
> {
  readonly resource: Resource;
  readonly selected: boolean;
  readonly selectedResourceIds: readonly Id[];
  readonly disabled: boolean;
  readonly readOnly?: boolean;
  readonly multiple: boolean;
  readonly resourceDataAttribute?: string;
  readonly classNames?: ResourcePickerClassNames;
  readonly isResourceDisabled?: (resource: Resource) => boolean;
  readonly getAvatarColor?: (resource: Resource) => string | undefined;
  readonly optionId?: string;
  readonly focused?: boolean;
  readonly onFocus?: () => void;
  readonly onChange: (resourceIds: readonly Id[]) => void;
}

export function ResourcePickerOption<
  Id extends ResourcePickerId,
  Resource extends ResourcePickerItem<Id>,
>({
  resource,
  selected,
  selectedResourceIds,
  disabled,
  readOnly = false,
  multiple,
  resourceDataAttribute,
  classNames,
  isResourceDisabled,
  getAvatarColor,
  optionId,
  focused = false,
  onFocus,
  onChange,
}: ResourcePickerOptionProps<Id, Resource>) {
  const resourceDisabled = isResourceDisabled?.(resource) === true;

  return (
    <label
      class={resourcePickerClasses(
        'rv-resource-picker__option',
        readOnly ? 'rv-resource-picker__option--readonly' : undefined,
        focused ? 'rv-resource-picker__option--focused' : undefined,
        classNames?.option,
      )}
      id={readOnly ? optionId : undefined}
      role={readOnly && optionId ? 'option' : undefined}
      aria-selected={readOnly && optionId ? selected : undefined}
      data-selected={selected ? 'true' : 'false'}
      style={
        resource.color
          ? { '--rv-resource-picker-accent': resource.color }
          : undefined
      }
      onMouseEnter={onFocus}
    >
      {!readOnly && (
        <input
          type="checkbox"
          aria-label={resource.name}
          id={optionId}
          role={optionId ? 'option' : undefined}
          aria-selected={optionId ? selected : undefined}
          checked={selected}
          disabled={disabled || (resourceDisabled && !selected)}
          {...resourcePickerDataAttribute(
            resourceDataAttribute,
            String(resource.id),
          )}
          onChange={(event) => {
            const input = event.currentTarget as HTMLInputElement;
            onChange(
              input.checked
                ? multiple
                  ? uniqueResourcePickerIds([
                      ...selectedResourceIds,
                      resource.id,
                    ])
                  : [resource.id]
                : selectedResourceIds.filter(
                    (resourceId) =>
                      resourcePickerIdKey(resourceId) !==
                      resourcePickerIdKey(resource.id),
                  ),
            );
          }}
        />
      )}
      <ResourcePickerAvatar
        resource={resource}
        className={classNames?.avatar}
        color={getAvatarColor?.(resource)}
      />
      <span
        class={resourcePickerClasses(
          'rv-resource-picker__details',
          classNames?.details,
        )}
      >
        <strong>{resource.name}</strong>
        {resource.role ? <em>{resource.role}</em> : null}
      </span>
    </label>
  );
}
