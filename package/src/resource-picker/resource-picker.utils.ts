import type { ResourcePickerId } from './resource-picker.types';

export function resourcePickerIdKey(id: ResourcePickerId): string {
  return String(id);
}

export function uniqueResourcePickerIds<Id extends ResourcePickerId>(
  ids: readonly Id[],
): readonly Id[] {
  return [...new Map(ids.map((id) => [resourcePickerIdKey(id), id])).values()];
}

export function resourcePickerDataAttribute(
  attribute: string | undefined,
  value: string,
): Record<string, string> {
  return attribute ? { [attribute]: value } : {};
}

export function resourcePickerClasses(
  ...values: readonly (string | undefined)[]
): string {
  return values.filter(Boolean).join(' ');
}
