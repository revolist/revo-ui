import type { UiComponentName, UiComponentProps } from './component-catalog';

export interface UiRenderSlot {
  prop: string;
  args: readonly string[];
  skipFactory?: boolean;
}
export const dropdownRenderSlots: Record<string, UiRenderSlot> = {
  option: {
    prop: 'renderOption',
    args: ['option', 'selected'],
    skipFactory: true,
  },
  value: { prop: 'renderValue', args: ['option'], skipFactory: true },
  placeholder: {
    prop: 'renderPlaceholder',
    args: ['placeholder'],
    skipFactory: true,
  },
  selectedValue: {
    prop: 'renderSelectedValue',
    args: ['selectedOptions'],
    skipFactory: true,
  },
  content: { prop: 'renderContent', args: ['content'] },
  noResults: { prop: 'renderNoResults', args: [], skipFactory: true },
};
export const pdfViewerRenderSlots: Record<string, UiRenderSlot> = {
  toolbar: {
    prop: 'renderToolbar',
    args: ['controller', 'state', 'toolbarProps'],
  },
  status: { prop: 'renderStatus', args: ['state'] },
};
export function componentRenderSlots(
  name: string,
): Record<string, UiRenderSlot> {
  if (
    ['Dropdown', 'Combobox', 'MultiSelect', 'DropdownPopupContent'].includes(
      name,
    )
  )
    return dropdownRenderSlots;
  if (name === 'PdfViewer') return pdfViewerRenderSlots;
  if (name === 'ReorderList')
    return {
      item: { prop: 'renderItem', args: ['item', 'index'] },
      handle: { prop: 'renderHandle', args: ['item', 'index'] },
    };
  return {};
}
type ComponentModels = {
  [K in UiComponentName]?: {
    prop: Extract<keyof UiComponentProps<K>, string>;
    callback: Extract<keyof UiComponentProps<K>, string>;
  };
};
export const componentModels: ComponentModels = {
  AiPromptInput: { prop: 'value', callback: 'onValueChange' },
  SearchInput: { prop: 'value', callback: 'onValueChange' },
  SharedResourcePicker: { prop: 'selectedResourceIds', callback: 'onChange' },
  CalendarPicker: { prop: 'selected', callback: 'onSelectionChange' },
  ColorPalette: { prop: 'value', callback: 'onChange' },
  DurationField: { prop: 'value', callback: 'onChange' },
  TemporalPicker: { prop: 'value', callback: 'onChange' },
  DateTimeField: { prop: 'value', callback: 'onValueChange' },
  Checkbox: {
    prop: 'checked',
    callback: 'onChange',
  },
  Switch: {
    prop: 'checked',
    callback: 'onChange',
  },
  SegmentedSwitch: {
    prop: 'value',
    callback: 'onChange',
  },
  ChoiceChips: {
    prop: 'value',
    callback: 'onChange',
  },
  ColorPicker: {
    prop: 'value',
    callback: 'onChange',
  },
  Dropdown: {
    prop: 'value',
    callback: 'onChange',
  },
  SingleValueSlider: {
    prop: 'value',
    callback: 'onChange',
  },
  ToggleButton: {
    prop: 'pressed',
    callback: 'onPressedChange',
  },
  SegmentedControl: {
    prop: 'value',
    callback: 'onChange',
  },
  Tabs: {
    prop: 'value',
    callback: 'onChange',
  },
  RadioGroup: {
    prop: 'value',
    callback: 'onChange',
  },
  TextInput: {
    prop: 'value',
    callback: 'onValueChange',
  },
  Textarea: {
    prop: 'value',
    callback: 'onValueChange',
  },
  NumberInput: {
    prop: 'value',
    callback: 'onValueChange',
  },
  NumberStepper: {
    prop: 'value',
    callback: 'onChange',
  },
  DateInput: {
    prop: 'value',
    callback: 'onValueChange',
  },
  TimeInput: {
    prop: 'value',
    callback: 'onValueChange',
  },
  DateTimeInput: {
    prop: 'value',
    callback: 'onValueChange',
  },
  Rating: {
    prop: 'value',
    callback: 'onChange',
  },
  Combobox: {
    prop: 'value',
    callback: 'onChange',
  },
  MultiSelect: {
    prop: 'value',
    callback: 'onChange',
  },
  DatePicker: {
    prop: 'value',
    callback: 'onChange',
  },
  DateRangePicker: {
    prop: 'value',
    callback: 'onChange',
  },
};
