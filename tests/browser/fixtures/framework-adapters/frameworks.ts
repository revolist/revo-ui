import '@angular/compiler';
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Button,
  Dropdown,
  Dialog,
  Tooltip,
  FieldGroupHeading,
  FieldGroup,
  FieldList,
  DatePicker,
  Switch,
  SegmentedSwitch,
  Stepper,
  CalendarNavigator,
} from '@revolist/ui/react';
import { presetProps } from '@revolist/ui/presets';
import { theme } from './shared-theme';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  CalendarNavigator as AngularCalendarNavigator,
  UiComponent,
  UiSlotDirective,
} from '@revolist/ui/angular';
import { mount } from 'svelte';
import SvelteHarness from './SvelteHarness.svelte';

function ReactHarness() {
  const [value, setValue] = useState('a');
  const [workflow, setWorkflow] = useState([
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
  ]);
  const [themed, setThemed] = useState(true);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(true);
  return h(
    'section',
    { 'aria-label': 'React adapters' },
    h('button', { onClick: () => setMounted(!mounted) }, 'Toggle React'),
    h(Switch, {
      ...presetProps(theme.components.Switch?.shared),
      label: 'React shared theme',
      checked: themed,
      disabled: false,
      onChange: setThemed,
    }),
    h('output', { 'data-react-value': '' }, value),
    h(CalendarNavigator, {
      value: '2026-10-10',
      today: '2026-10-10',
      labels: { calendar: 'Open React navigator' },
      onChange() {},
      renderCalendarDay: ({ date }) =>
        h('span', { 'data-react-navigator-day': date }, date),
      renderCalendarFooter: () =>
        h('span', { 'data-react-navigator-footer': '' }, 'React footer'),
    }),
    h(
      'button',
      { onClick: () => setWorkflow([...workflow].reverse()) },
      'Reorder React steps',
    ),
    h(Stepper, {
      label: 'React workflow',
      steps: workflow,
      value: 'a',
      renderStepIcon: ({ step }) =>
        h('b', { 'data-react-step-icon': step.id }, step.label),
      renderStepContent: ({ step }) =>
        h('input', { 'aria-label': `React ${step.id} step draft` }),
    }),
    h(SegmentedSwitch, {
      value,
      options: [
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Beta' },
      ],
      onChange: (next) => setValue(String(next)),
      renderOption: (option, state) =>
        h(
          'strong',
          { 'data-react-segment': '' },
          `${option.label}:${state.active}`,
        ),
    }),
    h(DatePicker, {
      label: 'React custom date',
      openLabel: 'Choose React custom date',
      defaultValue: '2024-03-01',
      dateInput: false,
      renderTrigger: (props) => h('button', props),
    }),
    h(
      FieldGroup,
      { heading: h('strong', null, 'React configurator heading') },
      h(
        FieldGroupHeading,
        {
          actions: h(
            'button',
            { onClick: () => setValue('b') },
            'Add React field',
          ),
        },
        'Fields',
      ),
      h(FieldList, {
        empty: true,
        placeholder: h('em', null, 'No React fields'),
      }),
    ),
    h(
      Tooltip,
      { content: h('strong', null, 'React tooltip details') },
      h('button', null, 'React help'),
    ),
    mounted &&
      h(Dropdown, {
        source: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
        value,
        onChange: (next) => setValue(next as string),
        config: { ariaLabel: 'React status' },
        renderOption: (option) =>
          h('strong', { 'data-react-option': '' }, option.label),
      }),
    mounted &&
      h(Dropdown, {
        value,
        config: { ariaLabel: 'React secondary status' },
        onChange: (next) => setValue(String(next)),
        source: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
      }),
    h(Button, { onClick: () => setOpen(true) }, 'Open React editor'),
    mounted &&
      h(
        Dialog,
        {
          open,
          title: 'React editor',
          closeLabel: 'Close',
          onClose: () => setOpen(false),
          footer: h('button', { onClick: () => setOpen(false) }, 'Done React'),
        },
        h('input', { 'aria-label': 'React dialog name' }),
      ),
  );
}
@Component({
  selector: 'ui-framework-harness',
  standalone: true,
  imports: [AngularCalendarNavigator, UiComponent, UiSlotDirective],
  template: `<section aria-label="Angular adapters">
    <button (click)="mounted = !mounted">Toggle Angular</button>
    <output data-angular-value>{{ value }}</output>
    <rv-calendar-navigator
      value="2026-10-10"
      today="2026-10-10"
      [labels]="{ calendar: 'Open Angular navigator' }"
    >
      <ng-template rvUiSlot="calendarDay" let-date="date"
        ><span [attr.data-angular-navigator-day]="date">{{
          date
        }}</span></ng-template
      >
      <ng-template rvUiSlot="calendarFooter"
        ><span data-angular-navigator-footer>Angular footer</span></ng-template
      >
    </rv-calendar-navigator>
    <button (click)="workflow = workflow.slice().reverse()">
      Reorder Angular steps
    </button>
    <rv-ui
      component="Stepper"
      [props]="{ label: 'Angular workflow', steps: workflow, value: 'a' }"
    >
      <ng-template rvUiSlot="stepIcon" let-step="step"
        ><b [attr.data-angular-step-icon]="step.id">{{
          step.label
        }}</b></ng-template
      >
      <ng-template rvUiSlot="stepContent" let-step="step"
        ><input [attr.aria-label]="'Angular ' + step.id + ' step draft'"
      /></ng-template>
    </rv-ui>
    <rv-ui
      component="MetricTile"
      [props]="{
        label: 'Angular metric',
        value: '1',
        visual: { accent: 'red' },
      }"
    >
      <ng-template rvUiSlot="visualIcon"
        ><strong data-angular-metric-icon>Angular icon</strong></ng-template
      >
    </rv-ui>
    <rv-ui
      component="SegmentedSwitch"
      [props]="{ options: source, value: value }"
      (valueChange)="value = $any($event)"
    >
      <ng-template rvUiSlot="option" let-option="option" let-state="state">
        <strong data-angular-segment
          >{{ option.label }}:{{ state.active }}</strong
        >
      </ng-template>
    </rv-ui>
    <rv-ui
      component="SearchInput"
      [props]="{ value: search, 'aria-label': 'Angular search query' }"
      (valueChange)="search = $any($event)"
    ></rv-ui>
    <output data-angular-search>{{ search }}</output>
    <button (click)="search = ''">Clear Angular search</button>
    <rv-ui
      component="Panel"
      [props]="{ label: 'Slot revision ' + slotRevision }"
    >
      <ng-template rvUiSlot="default"
        ><input
          aria-label="Angular slot draft"
          (input)="slotRevision = slotRevision + 1"
      /></ng-template>
    </rv-ui>
    <rv-ui component="Tooltip">
      <ng-template rvUiSlot="content"
        ><strong>Angular tooltip details</strong></ng-template
      >
      <ng-template rvUiSlot="default"
        ><button>Angular help</button></ng-template
      >
    </rv-ui>
    @if (mounted) {
      <rv-ui
        component="Dropdown"
        [props]="{
          source: source,
          value: value,
          config: { ariaLabel: 'Angular status' },
        }"
        (valueChange)="value = $any($event)"
      >
        <ng-template rvUiSlot="option" let-option="option"
          ><strong data-angular-option>{{ option.label }}</strong></ng-template
        >
      </rv-ui>
      <rv-ui
        component="Dialog"
        [props]="{ open: open, title: 'Angular editor', closeLabel: 'Close' }"
        (uiEvent)="closed($event)"
      >
        <ng-template rvUiSlot="default"
          ><input aria-label="Angular dialog name"
        /></ng-template>
        <ng-template rvUiSlot="footer"
          ><button (click)="open = false">Done Angular</button></ng-template
        >
      </rv-ui>
    }
    <button (click)="open = true">Open Angular editor</button>
  </section>`,
})
class AngularHarness {
  value = 'a';
  workflow = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
  ];
  open = false;
  mounted = true;
  search = '';
  slotRevision = 0;
  source = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
  closed(event: { name: string }) {
    if (event.name === 'onClose') this.open = false;
  }
}
const react = document.createElement('div');
document.body.append(react);
createRoot(react).render(h(ReactHarness));
const svelte = document.createElement('div');
document.body.append(svelte);
mount(SvelteHarness, { target: svelte });
const angular = document.createElement('ui-framework-harness');
document.body.append(angular);
void bootstrapApplication(AngularHarness);
