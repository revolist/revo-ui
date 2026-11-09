import { createApp, h, ref } from 'vue';
import {
  Button,
  Dropdown,
  Dialog,
  DatePicker,
  Tooltip,
  Panel,
  Popover,
} from '@revolist/ui/vue';
import '@revolist/ui/styles.scss';

createApp({
  setup() {
    const status = ref('a');
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
          { default: () => h('button', 'Vue help') },
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
