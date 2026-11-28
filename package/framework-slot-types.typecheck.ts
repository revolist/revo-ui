// Compile-time coverage for framework slot declarations.
import type { UiComponentSlotContexts } from './component-metadata';
import type { ISODateString } from '@revolist/ui-dates';
import {
  ReorderList,
  SegmentedSwitch,
  Stepper,
  ActivityTimeline,
  CalendarNavigator,
} from './vue';
import {
  Stepper as ReactStepper,
  ActivityTimeline as ReactActivityTimeline,
  Trace as ReactTrace,
  CalendarNavigator as ReactCalendarNavigator,
} from './react';
import type { SvelteComponentProps } from './svelte-props';
import { createElement } from 'react';

type Assert<T extends true> = T;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;
type ReorderProps = InstanceType<typeof ReorderList>['$props'];
type OptionalRenderer = Assert<IsOptional<ReorderProps, 'renderItem'>>;
type OptionScope = Parameters<
  NonNullable<InstanceType<typeof SegmentedSwitch>['$slots']['option']>
>[0];
type HasActiveState = Assert<Equal<OptionScope['state']['active'], boolean>>;
type DateScope = UiComponentSlotContexts<'Calendar'>['day'];
type HasDate = Assert<Equal<DateScope['date'], ISODateString>>;
type StepScope = Parameters<
  NonNullable<InstanceType<typeof Stepper>['$slots']['stepContent']>
>[0];
type HasStepId = Assert<Equal<StepScope['step']['id'], string>>;
type NavigatorDay = Parameters<
  NonNullable<InstanceType<typeof CalendarNavigator>['$slots']['calendarDay']>
>[0];
type NavigatorHasDate = Assert<Equal<NavigatorDay['date'], ISODateString>>;
type SvelteCalendarSlots = NonNullable<
  SvelteComponentProps<'CalendarPicker'>['slots']
>;
type SvelteHasCalendarDay = Assert<
  'day' extends keyof SvelteCalendarSlots ? true : false
>;
type SvelteSegmentedSlots = NonNullable<
  SvelteComponentProps<'SegmentedSwitch'>['slots']
>;
type SvelteHasSegmentedOption = Assert<
  'option' extends keyof SvelteSegmentedSlots ? true : false
>;
type SvelteOptionalItemRenderer = Assert<
  IsOptional<SvelteComponentProps<'ReorderList'>, 'renderItem'>
>;
type SvelteOptionalAvatar = Assert<
  IsOptional<SvelteComponentProps<'ActivityMessage'>, 'avatar'>
>;
type SvelteOptionalChildren = Assert<
  IsOptional<SvelteComponentProps<'ActivityMessage'>, 'children'>
>;
createElement(ReactStepper, {
  label: 'Workflow',
  steps: [{ id: 'a', label: 'Alpha', icon: createElement('span', null, 'A') }],
  renderStepContent: ({ step, index }) =>
    createElement('span', null, `${step.label}:${index}`),
});
createElement(ReactActivityTimeline, {
  label: 'Activity',
  entries: [{ id: 'a' }],
  renderEntryAvatar: ({ entry }) => createElement('span', null, entry.id),
  renderEntryContent: ({ entry }) => createElement('span', null, entry.id),
  renderEntryTimestamp: () => createElement('time'),
});
createElement(ReactTrace, {
  label: 'Trace',
  steps: [{ id: 'a', children: [{ id: 'b' }] }],
  renderStepTitle: ({ step }) => step.id,
});
createElement(ReactCalendarNavigator, {
  value: '2026-10-10',
  today: '2026-10-10',
  onChange() {},
  renderCalendarDay: ({ date }) => createElement('span', null, date),
});
const vueEntries: InstanceType<typeof ActivityTimeline>['$props']['entries'] = [
  { id: 'a' },
];
const svelteEntries: SvelteComponentProps<'ActivityTimeline'>['entries'] = [
  { id: 'a' },
];
const svelteEmptyState: SvelteComponentProps<'AiChatEmptyState'> = {
  renderContent: (host: HTMLElement) => {
    host.textContent = 'Mounted';
    return () => host.replaceChildren();
  },
};
void svelteEmptyState;
type OtherEntriesOptional = Assert<
  typeof vueEntries extends readonly { id: string }[]
    ? typeof svelteEntries extends readonly { id: string }[]
      ? true
      : false
    : false
>;
export type FrameworkSlotTypeChecks =
  | OptionalRenderer
  | HasActiveState
  | HasDate
  | HasStepId
  | NavigatorHasDate;
export type SvelteScopedSlotChecks =
  | SvelteHasCalendarDay
  | SvelteHasSegmentedOption
  | SvelteOptionalItemRenderer
  | SvelteOptionalAvatar
  | SvelteOptionalChildren;
export type FrameworkNestedTypeChecks = OtherEntriesOptional;
