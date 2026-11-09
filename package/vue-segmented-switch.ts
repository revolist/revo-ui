import { h, type FunctionalComponent } from 'vue';
import {
  renderSegmentedSwitch,
  type SegmentedSwitchProps,
} from './segmented-switch';

/** Vue renders the shared switch directly, preserving SSR and native events. */
export const VueSegmentedSwitch: FunctionalComponent<SegmentedSwitchProps> = (
  props,
  { slots },
) =>
  renderSegmentedSwitch(
    (tag, attributes, ...children) => {
      const { onKeyDown, ...rest } = attributes;
      return h(
        tag,
        { ...rest, ...(onKeyDown ? { onKeydown: onKeyDown } : {}) },
        children,
      );
    },
    {
      ...props,
      ...(slots.option
        ? {
            renderOption: (option, state) =>
              slots.option!({ option, ...state }),
          }
        : {}),
    },
  );

VueSegmentedSwitch.props = [
  'value',
  'options',
  'onChange',
  'ariaLabel',
  'className',
  'itemClassName',
  'countClassName',
  'activeClassName',
  'disabled',
  'iconOnly',
  'title',
  'role',
  'testId',
  'renderOption',
  'renderCount',
];
