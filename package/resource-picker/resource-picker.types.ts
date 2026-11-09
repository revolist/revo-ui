type ResourceIdentityId = string | number;
interface ResourceIdentity<Id extends ResourceIdentityId> {
  readonly id: Id;
  readonly name: string;
  readonly avatarUrl?: string;
  readonly role?: string;
  readonly metadata?: Record<string, unknown>;
}

export type ResourcePickerId = ResourceIdentityId;

export interface ResourcePickerItem<
  Id extends ResourcePickerId = ResourcePickerId,
> extends ResourceIdentity<Id> {
  readonly color?: string;
}

export interface ResourcePickerText {
  readonly groupAriaLabel: string;
  readonly searchPlaceholder: string;
  readonly searchAriaLabel: string;
  readonly emptyResources: string;
  readonly emptySearch: string;
}

export interface ResourcePickerClassNames {
  readonly root?: string;
  readonly search?: string;
  readonly list?: string;
  readonly option?: string;
  readonly avatar?: string;
  readonly details?: string;
  readonly muted?: string;
}

export interface ResourcePickerUnassignedOption {
  readonly label: string;
  readonly dataAttribute?: string;
}

export interface SharedResourcePickerProps<
  Id extends ResourcePickerId,
  Resource extends ResourcePickerItem<Id>,
> {
  readonly resources: readonly Resource[];
  readonly selectedResourceIds: readonly Id[];
  readonly text: ResourcePickerText;
  readonly onChange: (resourceIds: readonly Id[]) => void;
  readonly classNames?: ResourcePickerClassNames;
  readonly disabled?: boolean;
  /** Shows resource details without checkbox controls or selection changes. */
  readonly readOnly?: boolean;
  /** Keeps the full list visible or presents it as a compact combobox. */
  readonly presentation?: 'inline' | 'dropdown';
  /** Allows more than one selected resource. Defaults to true. */
  readonly multiple?: boolean;
  /** Keeps resources in caller-provided order instead of sorting by name. */
  readonly preserveOrder?: boolean;
  readonly unassigned?: ResourcePickerUnassignedOption;
  readonly resourceDataAttribute?: string;
  readonly isResourceDisabled?: (resource: Resource) => boolean;
  readonly getAvatarColor?: (resource: Resource) => string | undefined;
}
