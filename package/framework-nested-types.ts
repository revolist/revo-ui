import type { UiComponentName, UiComponentProps } from './component-catalog';
import type { TraceStep } from './trace';

export type UiFrameworkComponentName = UiComponentName;

type OptionalFields<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, Extract<keyof T, K>> & Partial<Pick<T, Extract<keyof T, K>>>
  : never;
type RelaxArray<T, Fields extends PropertyKey> = T extends (infer Item)[]
  ? OptionalFields<Item, Fields>[]
  : T extends readonly (infer Item)[]
    ? readonly OptionalFields<Item, Fields>[]
    : T;
type RelaxProperty<P, Key extends PropertyKey, Fields extends PropertyKey> = {
  [K in keyof P]: K extends Key ? RelaxArray<P[K], Fields> : P[K];
};
type FrameworkTraceStep = OptionalFields<
  Omit<TraceStep, 'children'>,
  'title' | 'status'
> & {
  children?: readonly FrameworkTraceStep[];
};

/** Framework content slots can supply otherwise-required content inside data entries. */
export type UiFrameworkProps<K extends UiFrameworkComponentName> =
  K extends 'ActivityTimeline'
    ? RelaxProperty<
        UiComponentProps<K>,
        'entries',
        'avatar' | 'timestamp' | 'content'
      >
    : K extends 'Trace'
      ? Omit<UiComponentProps<K>, 'steps'> & {
          steps: readonly FrameworkTraceStep[];
        }
      : K extends
            | 'ChoiceChips'
            | 'SegmentedSwitch'
            | 'SegmentedControl'
            | 'Tabs'
            | 'RadioGroup'
        ? RelaxProperty<UiComponentProps<K>, 'options', 'label'>
        : UiComponentProps<K>;
