import type { UiComponentName, UiComponentProps } from './component-catalog';
import type {
  UiFrameworkComponentName,
  UiFrameworkProps,
} from './framework-nested-types';

export interface UiRenderSlot {
  prop: string;
  args: readonly string[];
  skipFactory?: boolean;
}

/** A framework content boundary inside structured component props. `*` visits array entries. */
export interface UiNestedSlot {
  path: readonly string[];
  item?: string;
  recursiveChildren?: string;
  create?: boolean;
  args?: readonly string[];
}

const daySlot = { args: ['date', 'context'], create: true } as const;
const nestedSlots = {
  Stepper: {
    stepIcon: { path: ['steps', '*', 'icon'], item: 'step' },
    stepContent: { path: ['steps', '*', 'content'], item: 'step' },
  },
  CommandPalette: {
    commandIcon: { path: ['commands', '*', 'icon'], item: 'command' },
  },
  Attachments: {
    itemPreview: { path: ['items', '*', 'preview'], item: 'item' },
  },
  ActivityTimeline: {
    entryAvatar: { path: ['entries', '*', 'avatar'], item: 'entry' },
    entryTimestamp: { path: ['entries', '*', 'timestamp'], item: 'entry' },
    entryHeader: { path: ['entries', '*', 'header'], item: 'entry' },
    entryContent: { path: ['entries', '*', 'content'], item: 'entry' },
    entryActions: { path: ['entries', '*', 'actions'], item: 'entry' },
    entryDetails: { path: ['entries', '*', 'details'], item: 'entry' },
  },
  Trace: {
    stepTitle: {
      path: ['steps', '*', 'title'],
      item: 'step',
      recursiveChildren: 'children',
    },
    stepStatus: {
      path: ['steps', '*', 'status'],
      item: 'step',
      recursiveChildren: 'children',
    },
    stepDetails: {
      path: ['steps', '*', 'details'],
      item: 'step',
      recursiveChildren: 'children',
    },
  },
  ChoiceChips: {
    optionLabel: { path: ['options', '*', 'label'], item: 'option' },
    optionInfo: { path: ['options', '*', 'info'], item: 'option' },
  },
  SegmentedSwitch: {
    optionLabel: { path: ['options', '*', 'label'], item: 'option' },
  },
  SegmentedControl: {
    optionLabel: { path: ['options', '*', 'label'], item: 'option' },
  },
  Tabs: { optionLabel: { path: ['options', '*', 'label'], item: 'option' } },
  RadioGroup: {
    optionLabel: { path: ['options', '*', 'label'], item: 'option' },
  },
  DialogActionFooter: {
    cancelLabel: { path: ['cancel', 'label'], create: true },
    saveLabel: { path: ['save', 'label'], create: true },
    deleteLabel: { path: ['deleteAction', 'label'] },
    resetLabel: { path: ['reset', 'label'] },
  },
  MetricTile: { visualIcon: { path: ['visual', 'icon'] } },
  MetricPanel: {
    itemVisualIcon: { path: ['items', '*', 'visual', 'icon'], item: 'item' },
  },
  BrushRange: {
    chartTooltip: {
      path: ['chart', 'renderTooltip'],
      args: ['datum', 'index'],
    },
  },
  TemporalPicker: {
    calendarFooter: { path: ['calendar', 'footer'], create: true },
    calendarDay: { path: ['calendar', 'renderDay'], ...daySlot },
  },
  CalendarNavigator: {
    calendarFooter: { path: ['calendar', 'footer'], create: true },
    calendarDay: { path: ['calendar', 'renderDay'], ...daySlot },
  },
  TemporalDraft: {
    calendarFooter: { path: ['options', 'calendar', 'footer'], create: true },
    calendarDay: { path: ['options', 'calendar', 'renderDay'], ...daySlot },
  },
  DateTimeField: {
    calendarFooter: { path: ['picker', 'calendar', 'footer'], create: true },
    calendarDay: { path: ['picker', 'calendar', 'renderDay'], ...daySlot },
  },
} as const satisfies Record<string, Record<string, UiNestedSlot>>;

export function componentNestedSlots(
  name: string,
): Record<string, UiNestedSlot> {
  return nestedSlots[name as keyof typeof nestedSlots] ?? {};
}
export type UiNestedRootKeys<K extends UiFrameworkComponentName> = K extends
  | 'Stepper'
  | 'Trace'
  ? 'steps'
  : K extends 'ActivityTimeline'
    ? 'entries'
    : K extends 'CommandPalette'
      ? 'commands'
      : K extends 'Attachments' | 'MetricPanel'
        ? 'items'
        : K extends
              | 'ChoiceChips'
              | 'SegmentedSwitch'
              | 'SegmentedControl'
              | 'Tabs'
              | 'RadioGroup'
          ? 'options'
          : K extends 'DialogActionFooter'
            ? 'cancel' | 'save' | 'deleteAction' | 'reset'
            : K extends 'MetricTile'
              ? 'visual'
              : K extends 'BrushRange'
                ? 'chart'
                : K extends 'CalendarNavigator' | 'TemporalPicker'
                  ? 'calendar'
                  : K extends 'TemporalDraft'
                    ? 'options'
                    : K extends 'DateTimeField'
                      ? 'picker'
                      : never;

type CallbackArgs<
  K extends UiComponentName,
  P extends PropertyKey,
> = P extends keyof UiComponentProps<K>
  ? NonNullable<UiComponentProps<K>[P]> extends (...args: infer A) => unknown
    ? A
    : never
  : never;
type SlotScope<
  K extends UiComponentName,
  P extends PropertyKey,
  Names extends readonly string[],
  Factory extends boolean = false,
> =
  CallbackArgs<K, P> extends infer A extends unknown[]
    ? (
        Factory extends true
          ? A extends [unknown, ...infer Rest]
            ? Rest
            : []
          : A
      ) extends infer Values extends unknown[]
      ? {
          [I in keyof Names as I extends `${number}`
            ? Names[I]
            : never]: I extends keyof Values ? Values[I] : never;
        }
      : never
    : never;

type ItemOf<
  K extends UiFrameworkComponentName,
  P extends keyof UiFrameworkProps<K>,
> =
  NonNullable<UiFrameworkProps<K>[P]> extends readonly (infer Item)[]
    ? Item
    : never;

/** Contexts for content inside structured component props. */
export type UiNestedSlotContexts<K extends UiFrameworkComponentName> =
  K extends 'Stepper'
    ? {
        stepIcon: { step: ItemOf<K, 'steps'>; index: number };
        stepContent: { step: ItemOf<K, 'steps'>; index: number };
      }
    : K extends 'ActivityTimeline'
      ? {
          entryAvatar: { entry: ItemOf<K, 'entries'>; index: number };
          entryTimestamp: { entry: ItemOf<K, 'entries'>; index: number };
          entryHeader: { entry: ItemOf<K, 'entries'>; index: number };
          entryContent: { entry: ItemOf<K, 'entries'>; index: number };
          entryActions: { entry: ItemOf<K, 'entries'>; index: number };
          entryDetails: { entry: ItemOf<K, 'entries'>; index: number };
        }
      : K extends 'CommandPalette'
        ? {
            commandIcon: { command: ItemOf<K, 'commands'>; index: number };
          }
        : K extends 'Attachments'
          ? {
              itemPreview: { item: ItemOf<K, 'items'>; index: number };
            }
          : K extends 'Trace'
            ? {
                stepTitle: {
                  step: ItemOf<K, 'steps'>;
                  index: number;
                  path: number[];
                };
                stepStatus: {
                  step: ItemOf<K, 'steps'>;
                  index: number;
                  path: number[];
                };
                stepDetails: {
                  step: ItemOf<K, 'steps'>;
                  index: number;
                  path: number[];
                };
              }
            : K extends 'ChoiceChips'
              ? {
                  optionLabel: { option: ItemOf<K, 'options'>; index: number };
                  optionInfo: { option: ItemOf<K, 'options'>; index: number };
                }
              : K extends
                    | 'SegmentedSwitch'
                    | 'SegmentedControl'
                    | 'Tabs'
                    | 'RadioGroup'
                ? {
                    optionLabel: {
                      option: ItemOf<K, 'options'>;
                      index: number;
                    };
                  }
                : K extends 'MetricPanel'
                  ? {
                      itemVisualIcon: {
                        item: ItemOf<K, 'items'>;
                        index: number;
                      };
                    }
                  : K extends 'MetricTile'
                    ? { visualIcon: Record<string, never> }
                    : K extends 'DialogActionFooter'
                      ? {
                          cancelLabel: Record<string, never>;
                          saveLabel: Record<string, never>;
                          deleteLabel: Record<string, never>;
                          resetLabel: Record<string, never>;
                        }
                      : K extends 'BrushRange'
                        ? {
                            chartTooltip: SlotScope<
                              'DistributionChart',
                              'renderTooltip',
                              ['datum', 'index']
                            >;
                          }
                        : K extends
                              | 'CalendarNavigator'
                              | 'TemporalPicker'
                              | 'TemporalDraft'
                              | 'DateTimeField'
                          ? {
                              calendarFooter: Record<string, never>;
                              calendarDay: SlotScope<
                                'Calendar',
                                'renderDay',
                                ['date', 'context']
                              >;
                            }
                          : {};
type NestedSlotContextMismatch = {
  [K in keyof typeof nestedSlots]:
    | Exclude<keyof (typeof nestedSlots)[K], keyof UiNestedSlotContexts<K>>
    | Exclude<keyof UiNestedSlotContexts<K>, keyof (typeof nestedSlots)[K]>;
}[keyof typeof nestedSlots];
type AssertNestedSlotContexts<T extends true> = T;
type NestedSlotContextsMatch = AssertNestedSlotContexts<
  [NestedSlotContextMismatch] extends [never] ? true : false
>;
type NestedSlotRootMismatch = {
  [K in keyof typeof nestedSlots]: (typeof nestedSlots)[K][keyof (typeof nestedSlots)[K]] extends infer Slot
    ? Slot extends UiNestedSlot
      ? Exclude<Slot['path'][0], UiNestedRootKeys<K>>
      : never
    : never;
}[keyof typeof nestedSlots];
type NestedSlotRootsMatch = AssertNestedSlotContexts<
  [NestedSlotRootMismatch] extends [never] ? true : false
>;

/** Contexts supplied to scoped framework slots. Named content props use their prop name. */
type UiRenderSlotContexts<K extends UiComponentName> = K extends
  | 'Dropdown'
  | 'Combobox'
  | 'MultiSelect'
  ? {
      option: SlotScope<K, 'renderOption', ['option', 'selected'], true>;
      value: SlotScope<K, 'renderValue', ['option'], true>;
      placeholder: SlotScope<K, 'renderPlaceholder', ['placeholder'], true>;
      selectedValue: SlotScope<
        K,
        'renderSelectedValue',
        ['selectedOptions'],
        true
      >;
      content: SlotScope<K, 'renderContent', ['content']>;
      noResults: Record<string, never>;
    }
  : K extends 'DropdownPopupContent'
    ? {
        option: SlotScope<K, 'renderOption', ['option', 'selected'], true>;
        noResults: Record<string, never>;
      }
    : K extends 'SegmentedSwitch' | 'SegmentedControl' | 'Tabs'
      ? {
          option: SlotScope<K, 'renderOption', ['option', 'state']>;
          count: SlotScope<K, 'renderCount', ['option', 'state']>;
        }
      : K extends 'Calendar' | 'CalendarMonthGrid' | 'CalendarPicker'
        ? {
            day: SlotScope<K, 'renderDay', ['date', 'context']>;
          }
        : K extends 'DatePicker' | 'DateRangePicker'
          ? {
              day: SlotScope<K, 'renderDay', ['date', 'context']>;
              trigger: SlotScope<K, 'renderTrigger', ['props']>;
            }
          : K extends
                | 'DistributionChart'
                | 'BarChart'
                | 'LineChart'
                | 'AreaChart'
            ? {
                tooltip: SlotScope<K, 'renderTooltip', ['datum', 'index']>;
              }
            : K extends 'HistoryReview'
              ? { changes: SlotScope<K, 'renderChanges', ['context']> }
              : K extends 'AiResultView'
                ? { table: SlotScope<K, 'renderTable', ['result']> }
                : K extends 'Tooltip'
                  ? { content: SlotScope<K, 'renderContent', ['context']> }
                  : K extends 'ReorderList'
                    ? {
                        item: SlotScope<K, 'renderItem', ['item', 'index']>;
                        handle: SlotScope<K, 'renderHandle', ['item', 'index']>;
                      }
                    : K extends 'PdfViewer'
                      ? {
                          toolbar: SlotScope<
                            K,
                            'renderToolbar',
                            ['controller', 'state', 'toolbarProps']
                          >;
                          status: SlotScope<K, 'renderStatus', ['state']>;
                        }
                      : K extends 'AssigneeField'
                        ? {
                            picker: SlotScope<K, 'renderPicker', ['props']>;
                            value: SlotScope<
                              K,
                              'renderValue',
                              ['option', 'units'],
                              true
                            >;
                          }
                        : {};
export type UiComponentSlotContexts<K extends UiFrameworkComponentName> =
  UiRenderSlotContexts<K> & UiNestedSlotContexts<K>;
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
const calendarSlots = {
  day: { prop: 'renderDay', args: ['date', 'context'] },
} as const satisfies Record<string, UiRenderSlot>;
const segmentedSlots = {
  option: { prop: 'renderOption', args: ['option', 'state'] },
  count: { prop: 'renderCount', args: ['option', 'state'] },
} as const satisfies Record<string, UiRenderSlot>;
const chartSlots = {
  tooltip: { prop: 'renderTooltip', args: ['datum', 'index'] },
} as const satisfies Record<string, UiRenderSlot>;
const componentSlots: Record<string, Record<string, UiRenderSlot>> = {
  HistoryReview: { changes: { prop: 'renderChanges', args: ['context'] } },
  AiResultView: { table: { prop: 'renderTable', args: ['result'] } },
  SegmentedSwitch: segmentedSlots,
  SegmentedControl: segmentedSlots,
  Tabs: segmentedSlots,
  Calendar: calendarSlots,
  CalendarMonthGrid: calendarSlots,
  CalendarPicker: calendarSlots,
  DatePicker: {
    ...calendarSlots,
    trigger: { prop: 'renderTrigger', args: ['props'] },
  },
  DateRangePicker: {
    ...calendarSlots,
    trigger: { prop: 'renderTrigger', args: ['props'] },
  },
  DistributionChart: chartSlots,
  BarChart: chartSlots,
  LineChart: chartSlots,
  AreaChart: chartSlots,
  AssigneeField: {
    picker: { prop: 'renderPicker', args: ['props'] },
    value: {
      prop: 'renderValue',
      args: ['option', 'units'],
      skipFactory: true,
    },
  },
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
  if (name === 'Tooltip')
    return { content: { prop: 'renderContent', args: ['context'] } };
  if (name === 'ReorderList')
    return {
      item: { prop: 'renderItem', args: ['item', 'index'] },
      handle: { prop: 'renderHandle', args: ['item', 'index'] },
    };
  return componentSlots[name] ?? {};
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
  SearchActionBar: { prop: 'value', callback: 'onValueChange' },
  SharedResourcePicker: { prop: 'selectedResourceIds', callback: 'onChange' },
  CalendarPicker: { prop: 'selected', callback: 'onSelectionChange' },
  CalendarNavigator: { prop: 'value', callback: 'onChange' },
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
