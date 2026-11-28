import { createApp, h, nextTick } from 'vue';
import { describe, expect, it } from 'vitest';
import { uiComponents } from './component-catalog';
import { componentNestedSlots } from './component-metadata';
import {
  ActivityTimeline,
  CalendarNavigator,
  Attachments,
  BrushRange,
  ChoiceChips,
  CommandPalette,
  DateTimeField,
  DialogActionFooter,
  MetricPanel,
  MetricTile,
  RadioGroup,
  SegmentedControl,
  SegmentedSwitch,
  Stepper,
  Tabs,
  TemporalDraft,
  TemporalPicker,
  Trace,
} from './vue';

const settle = async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
};
const marker = (name: string) => (scope: Record<string, any>) =>
  h(
    'span',
    { 'data-nested-example': name },
    scope.step?.id ?? scope.item?.id ?? scope.entry?.id ?? scope.date ?? name,
  );

describe('nested content in real components', () => {
  it('renders every audited nested slot through the Vue adapter', async () => {
    const date = '2026-10-10';
    const slotNames: Record<string, string[]> = {
      Stepper: ['stepIcon', 'stepContent'],
      CommandPalette: ['commandIcon'],
      Attachments: ['itemPreview'],
      ActivityTimeline: [
        'entryAvatar',
        'entryTimestamp',
        'entryHeader',
        'entryContent',
        'entryActions',
        'entryDetails',
      ],
      Trace: ['stepTitle', 'stepStatus', 'stepDetails'],
      ChoiceChips: ['optionLabel', 'optionInfo'],
      SegmentedSwitch: ['optionLabel'],
      SegmentedControl: ['optionLabel'],
      Tabs: ['optionLabel'],
      RadioGroup: ['optionLabel'],
      DialogActionFooter: [
        'cancelLabel',
        'saveLabel',
        'deleteLabel',
        'resetLabel',
      ],
      MetricTile: ['visualIcon'],
      MetricPanel: ['itemVisualIcon'],
      BrushRange: ['chartTooltip'],
      TemporalPicker: ['calendarFooter', 'calendarDay'],
      TemporalDraft: ['calendarFooter', 'calendarDay'],
      DateTimeField: ['calendarFooter', 'calendarDay'],
      CalendarNavigator: ['calendarFooter', 'calendarDay'],
    };
    const expectedComponents = Object.keys(uiComponents).filter(
      (name) => Object.keys(componentNestedSlots(name)).length > 0,
    );
    expect(Object.keys(slotNames).sort()).toEqual(expectedComponents.sort());
    for (const [component, names] of Object.entries(slotNames))
      expect([...names].sort(), component).toEqual(
        Object.keys(componentNestedSlots(component)).sort(),
      );
    const slots = (name: string) =>
      Object.fromEntries(
        slotNames[name].map((slot) => [slot, marker(`${name}.${slot}`)]),
      );
    const options = [{ value: 'a' }];
    const calendar = { defaultMonth: '2026-10-01' };
    const chart = {
      ariaLabel: 'Nested chart',
      data: [{ key: 'a', value: 1, tooltip: { title: 'Alpha' } }],
    };
    const app = createApp({
      render: () =>
        h('main', [
          h(
            Stepper,
            { label: 'Workflow', steps: [{ id: 'a', label: 'Alpha' }] },
            slots('Stepper'),
          ),
          h(
            CommandPalette,
            {
              label: 'Commands',
              searchLabel: 'Search',
              emptyLabel: 'Empty',
              inline: true,
              commands: [{ id: 'a', label: 'Alpha' }],
              onExecute() {},
            },
            slots('CommandPalette'),
          ),
          h(
            Attachments,
            {
              label: 'Files',
              items: [{ id: 'a', name: 'Alpha' }],
              removeLabel: () => 'Remove',
            },
            slots('Attachments'),
          ),
          h(
            ActivityTimeline,
            { label: 'Activity', entries: [{ id: 'a' }] },
            slots('ActivityTimeline'),
          ),
          h(
            Trace,
            { label: 'Trace', steps: [{ id: 'a', children: [{ id: 'b' }] }] },
            slots('Trace'),
          ),
          h(
            ChoiceChips,
            { ariaLabel: 'Choice', options, onChange() {} },
            slots('ChoiceChips'),
          ),
          h(
            SegmentedSwitch,
            { value: 'a', options, onChange() {} },
            slots('SegmentedSwitch'),
          ),
          h(
            SegmentedControl,
            { value: 'a', options, onChange() {} },
            slots('SegmentedControl'),
          ),
          h(Tabs, { value: 'a', options, onChange() {} }, slots('Tabs')),
          h(
            RadioGroup,
            { label: 'Radio', value: 'a', options, onChange() {} },
            slots('RadioGroup'),
          ),
          h(
            DialogActionFooter,
            { deleteAction: {}, reset: {} },
            slots('DialogActionFooter'),
          ),
          h(
            MetricTile,
            { label: 'Metric', value: 1, visual: { accent: 'red' } },
            slots('MetricTile'),
          ),
          h(
            MetricPanel,
            {
              items: [{ label: 'Metric', value: 1, visual: { accent: 'red' } }],
            },
            slots('MetricPanel'),
          ),
          h(
            BrushRange,
            {
              chart,
              slider: {
                min: 0,
                max: 10,
                fromValue: 1,
                toValue: 2,
                onRangeChange() {},
              },
              startLabel: 'Start',
              selectionLabel: 'Selection',
              endLabel: 'End',
            },
            slots('BrushRange'),
          ),
          h(
            TemporalPicker,
            { value: date, dateInput: false, calendar, onChange() {} },
            slots('TemporalPicker'),
          ),
          h(
            TemporalDraft,
            {
              value: date,
              options: { calendar, dateInput: false },
              apply() {},
              cancel() {},
            },
            slots('TemporalDraft'),
          ),
          h(
            DateTimeField,
            { value: date, picker: { calendar, dateInput: false } },
            slots('DateTimeField'),
          ),
          h(
            CalendarNavigator,
            { value: date, today: date, calendar, onChange() {} },
            slots('CalendarNavigator'),
          ),
        ]),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    try {
      await settle();
      host
        .querySelector<HTMLElement>(
          '[data-rv-vue-host="CalendarNavigator"] button[aria-label="Choose date"]',
        )!
        .click();
      await settle();
      for (const name of slotNames.CalendarNavigator)
        expect(
          document.querySelector(
            `[data-nested-example="CalendarNavigator.${name}"]`,
          ),
        ).not.toBeNull();
      host
        .querySelector<HTMLElement>(
          '[aria-label="Nested chart"] [data-part="item"]',
        )!
        .focus();
      host
        .querySelector<HTMLElement>(
          '[data-rv-vue-host="DateTimeField"] button',
        )!
        .click();
      await settle();
      for (const [component, names] of Object.entries(slotNames)) {
        if (component === 'CalendarNavigator') continue;
        for (const name of names) {
          expect(
            document.querySelector(
              `[data-nested-example="${component}.${name}"]`,
            ),
            `${component}.${name}`,
          ).not.toBeNull();
        }
      }
      expect(
        document.querySelectorAll('[data-nested-example="Trace.stepTitle"]'),
      ).toHaveLength(2);
    } finally {
      app.unmount();
      host.remove();
    }
  });
});
