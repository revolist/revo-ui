import type { EditorCommitOptions } from '../editor-actions';
import type { DropdownOption } from '../dropdown/dropdown.types';
import type { AssigneeAssignment, AssigneeId } from './model';
export interface AssigneeOption extends DropdownOption<AssigneeId> {
  name?: string;
  role?: string;
  avatarUrl?: string;
  initials?: string;
  color?: string;
}
export interface AssigneeText {
  label?: string;
  dialogLabel?: string;
  nameColumn?: string;
  unitsColumn?: string;
  selectLabel?: (name: string) => string;
  removeLabel?: (label: string) => string;
  placeholder?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  empty?: string;
  selected?: (count: number) => string;
  unitsLabel?: (name: string) => string;
  invalidUnits?: string;
  apply?: string;
  cancel?: string;
}
export interface AssigneeFieldOptions extends EditorCommitOptions {
  source: AssigneeOption[];
  defaultUnits?: number;
  showAvatars?: boolean;
  text?: AssigneeText;
}
export interface AssigneePickerProps extends EditorCommitOptions {
  id: string;
  options: AssigneeOption[];
  value: AssigneeAssignment[];
  change: (value: AssigneeAssignment[]) => void;
  apply: () => void;
  cancel: () => void;
  theme?: string;
  defaultUnits: number;
  showAvatars?: boolean;
  text?: AssigneeText;
}
