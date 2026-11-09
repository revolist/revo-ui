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
} from '@revolist/ui/react';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { UiComponent, UiSlotDirective } from '@revolist/ui/angular';
import { mount } from 'svelte';
import SvelteHarness from './SvelteHarness.svelte';

function ReactHarness() {
  const [value, setValue] = useState('a');
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(true);
  return h(
    'section',
    { 'aria-label': 'React adapters' },
    h('button', { onClick: () => setMounted(!mounted) }, 'Toggle React'),
    h('output', { 'data-react-value': '' }, value),
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
      { text: 'React tooltip details' },
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
  imports: [UiComponent, UiSlotDirective],
  template: `<section aria-label="Angular adapters">
    <button (click)="mounted = !mounted">Toggle Angular</button>
    <output data-angular-value>{{ value }}</output>
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
    <rv-ui component="Tooltip" [props]="{ text: 'Angular tooltip details' }">
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
