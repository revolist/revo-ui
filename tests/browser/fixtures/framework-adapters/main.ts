import { createApp, h, ref } from 'vue';
import {
  Button,
  Dropdown,
  Dialog,
  DatePicker,
  DateRangePicker,
  Tooltip,
  Panel,
  Popover,
  Switch,
  SegmentedSwitch,
  MetricTile,
  Stepper,
  CalendarNavigator,
  ChoiceChips,
} from '@revolist/ui/vue';
import { presetProps } from '@revolist/ui/presets';
import { theme } from './shared-theme';

createApp({
  setup() {
    class ChoiceOption {
      constructor() {
        Object.defineProperty(this, 'identifier', {
          value: 'class-a',
          enumerable: false,
        });
      }
      get value() {
        return (this as any).identifier;
      }
      get label() {
        return 'Class option';
      }
    }
    const classOption = new ChoiceOption();
    const classChoice = ref('');
    const status = ref('a');
    const workflow = ref([
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ]);
    const themed = ref(true);
    const date = ref('2026-10-28');
    const open = ref(false);
    const mounted = ref(true);
    const revision = ref(0);
    const showContent = ref(false);
    const showFooter = ref(true);
    const slotClicks = ref(0);
    const popoverAnchor = ref<HTMLElement | null>(null);
    const popoverOpen = ref(false);
    const closeOnOutside = ref(true);
    const closeOnEscape = ref(true);
    const dialogProps = {
      title: 'Editor',
      closeLabel: 'Close',
      onClose: () => {
        open.value = false;
      },
    };
    return () =>
      h('main', [
        h(Switch, {
          ...presetProps(theme.components.Switch?.shared),
          label: 'Vue shared theme',
          modelValue: themed.value,
          disabled: false,
          'onUpdate:modelValue': (value: boolean) => {
            themed.value = value;
          },
        }),
        h(
          'button',
          {
            onClick: () => {
              mounted.value = !mounted.value;
            },
          },
          'Toggle components',
        ),
        h('output', { id: 'status' }, status.value),
        h('output', { 'data-vue-class-choice': '' }, classChoice.value),
        h(
          ChoiceChips,
          {
            ariaLabel: 'Class choice',
            options: [classOption],
            onChange: (value) => {
              classChoice.value = String(value);
            },
          },
          {
            optionLabel: ({ option }: any) => h('strong', option.label),
          },
        ),
        h(
          CalendarNavigator,
          {
            value: '2026-10-10',
            today: '2026-10-10',
            labels: { calendar: 'Open Vue navigator' },
            onChange() {},
          },
          {
            calendarDay: ({ date }: any) =>
              h('span', { 'data-vue-navigator-day': date }, date),
            calendarFooter: () =>
              h('span', { 'data-vue-navigator-footer': '' }, 'Vue footer'),
          },
        ),
        h(
          'button',
          {
            onClick: () => {
              workflow.value = [...workflow.value].reverse();
            },
          },
          'Reorder Vue steps',
        ),
        h(
          Stepper,
          { label: 'Vue workflow', steps: workflow.value, value: 'a' },
          {
            stepIcon: ({ step }: any) =>
              h('b', { 'data-vue-step-icon': step.id }, step.label),
            stepContent: ({ step }: any) =>
              h('input', { 'aria-label': `Vue ${step.id} step draft` }),
          },
        ),
        h(
          MetricTile,
          { label: 'Vue metric', value: '1', visual: { accent: 'red' } },
          {
            visualIcon: () =>
              h('strong', { 'data-vue-metric-icon': '' }, 'Vue icon'),
          },
        ),
        h(
          SegmentedSwitch,
          {
            value: status.value,
            options: [
              { value: 'a', label: 'Alpha' },
              { value: 'b', label: 'Beta' },
            ],
            onChange: (value) => {
              status.value = String(value);
            },
          },
          {
            option: ({ option, state }: any) =>
              h(
                'strong',
                { 'data-vue-segment': '' },
                `${option.label}:${state.active}`,
              ),
          },
        ),
        h(DatePicker, {
          label: 'Vue clearable date',
          openLabel: 'Choose Vue clearable date',
          defaultValue: '2024-03-01',
          clearable: '' as unknown as boolean,
        }),
        h(DateRangePicker, {
          label: 'Vue restricted range',
          openLabel: 'Choose Vue restricted range',
          fromLabel: 'From',
          toLabel: 'To',
          defaultMonth: '2024-03-01',
          'exclude-disabled': '',
          isDateDisabled: (date) => date === '2024-03-03',
        }),
        h('label', [
          h('input', {
            type: 'checkbox',
            checked: closeOnOutside.value,
            onChange: (event: Event) => {
              closeOnOutside.value = (event.target as HTMLInputElement).checked;
            },
          }),
          'Close popover on outside',
        ]),
        h('label', [
          h('input', {
            type: 'checkbox',
            checked: closeOnEscape.value,
            onChange: (event: Event) => {
              closeOnEscape.value = (event.target as HTMLInputElement).checked;
            },
          }),
          'Close popover on Escape',
        ]),
        h(
          'button',
          {
            ref: popoverAnchor,
            onClick: () => {
              popoverOpen.value = !popoverOpen.value;
            },
          },
          'Toggle Vue popover',
        ),
        h(
          Popover,
          {
            open: popoverOpen.value,
            anchor: popoverAnchor.value,
            label: 'Vue popover',
            'close-on-outside': closeOnOutside.value,
            'close-on-escape': closeOnEscape.value,
            onClose: () => {
              popoverOpen.value = false;
            },
          },
          {
            default: () => [
              h('input', {
                'aria-label': 'Popover draft',
                onInput: () => {
                  closeOnOutside.value = false;
                  closeOnEscape.value = false;
                },
              }),
              h(
                'button',
                {
                  onClick: () => {
                    popoverOpen.value = false;
                  },
                },
                'Close Vue popover',
              ),
            ],
          },
        ),
        h(
          'button',
          {
            onClick: () => {
              showContent.value = !showContent.value;
            },
          },
          'Toggle Vue content',
        ),
        h(
          'button',
          {
            onClick: () => {
              showFooter.value = !showFooter.value;
            },
          },
          'Toggle Vue footer',
        ),
        h('output', { 'data-vue-slot-clicks': '' }, slotClicks.value),
        h(
          Panel,
          null,
          showContent.value
            ? {
                default: () =>
                  h(
                    'button',
                    {
                      onClick: () => {
                        slotClicks.value++;
                      },
                    },
                    'Conditional Vue action',
                  ),
              }
            : {},
        ),
        h(
          Panel,
          { label: `Draft revision ${revision.value}` },
          {
            default: () =>
              h('input', {
                'aria-label': 'Vue slot draft',
                onInput: () => {
                  revision.value++;
                },
              }),
          },
        ),
        h(
          Tooltip,
          { text: 'Vue tooltip details' },
          {
            default: () => h('button', 'Vue help'),
            content: () => h('strong', 'Vue tooltip details'),
          },
        ),
        h(Dropdown, {
          config: { ariaLabel: 'Secondary status' },
          modelValue: status.value,
          source: [
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ],
          'onUpdate:modelValue': (value) => {
            status.value = String(value);
          },
        }),
        mounted.value &&
          h(
            Dropdown,
            {
              source: [
                { value: 'a', label: 'Alpha' },
                { value: 'b', label: 'Beta' },
              ],
              modelValue: status.value,
              'onUpdate:modelValue': (value) => {
                status.value = value as string;
              },
              config: { ariaLabel: 'Status' },
            },
            { option: ({ option }: any) => h('strong', option.label) },
          ),
        mounted.value &&
          h(DatePicker, {
            label: 'Date',
            openLabel: 'Choose date',
            modelValue: date.value,
            'onUpdate:modelValue': (value) => {
              date.value = value!;
            },
          }),
        h(
          Button,
          {
            onClick: () => {
              open.value = true;
            },
          },
          { default: () => 'Open editor' },
        ),
        mounted.value &&
          h(
            Dialog,
            { ...dialogProps, open: open.value },
            {
              default: () => h('input', { 'aria-label': 'Dialog name' }),
              ...(showFooter.value
                ? {
                    footer: () =>
                      h(
                        'button',
                        {
                          onClick: () => {
                            open.value = false;
                          },
                        },
                        'Done',
                      ),
                  }
                : {}),
            },
          ),
      ]);
  },
}).mount('#app');

import './frameworks';
