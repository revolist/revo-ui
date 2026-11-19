import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { mount } from 'svelte';
import {
  SvgButton,
  SearchInput,
  Dropdown,
  Dialog,
  Panel,
  DatePicker,
  UiSlotDirective,
} from '../../../../dist/angular/angular.js';
import NamedSvelteHarness from './NamedSvelteHarness.svelte';

@Component({
  selector: 'named-angular-harness',
  imports: [
    SvgButton,
    SearchInput,
    Dropdown,
    Dialog,
    Panel,
    UiSlotDirective,
    DatePicker,
  ],
  template: `
    <section aria-label="Angular named components">
      <button (click)="mounted = !mounted">Toggle controls</button>
      <output data-callbacks>{{ callbacks }}</output>
      <output data-events>{{ events }}</output>
      <output data-query>{{ query }}</output>
      <output data-selected>{{ selected }}</output>
      @if (mounted) {
        <rv-svg-button
          [label]="'Save ' + count"
          [visibleLabel]="'Save ' + count"
          (click)="count = count + 1"
          [onClick]="onButtonClick"
          (clickEvent)="events = events + 1"
        />
        <rv-search-input
          [value]="query"
          [aria-label]="'Angular search'"
          (valueChange)="query = $event"
        />
        <button (click)="query = ''">Clear search</button>
        <rv-panel [className]="projectedClass">
          <input
            aria-label="Angular projected draft"
            (input)="projectedClass = $any($event.target).value"
          />
        </rv-panel>
        <rv-dropdown
          [source]="options"
          [value]="selected"
          [config]="{ ariaLabel: 'Angular status' }"
          (valueChange)="selected = $any($event)"
        >
          <ng-template rvUiSlot="option" let-option="option"
            ><strong>{{ option.label }}</strong></ng-template
          >
        </rv-dropdown>
        <rv-dialog
          [open]="open"
          title="Angular editor"
          closeLabel="Close"
          [onClose]="closeEditor"
        >
          <ng-template rvUiSlot="default"
            ><input aria-label="Angular draft" /><button
              (click)="count = count + 1"
            >
              Update counter
            </button></ng-template
          >
          <ng-template rvUiSlot="footer"
            ><button (click)="open = false">Done</button></ng-template
          >
        </rv-dialog>
        <button (click)="open = true">Open editor</button>
      }
    </section>
    <form aria-label="Angular date form">
      <rv-date-picker
        label="Angular date"
        openLabel="Choose Angular date"
        name="date"
        defaultMonth="2024-03-01"
      />
    </form>
    <rv-date-picker
      label="Angular bounded date"
      openLabel="Choose Angular bounded date"
      value="2024-03-30"
      [minDate]="minimumDate"
    />
    <button (click)="minimumDate = '2024-03-31'">Raise date minimum</button>
    <rv-date-picker
      label="Angular outside day"
      openLabel="Choose Angular outside day"
      month="2024-03-01"
      value="2024-03-01"
      [minDate]="outsideMinimum"
      [showOutsideDays]="true"
      [allowOutsideMonthSelection]="true"
    />
    <button (click)="outsideMinimum = '2024-03-01'">
      Restrict outside dates
    </button>
    <button (click)="outsideMinimum = '2024-04-01'">
      Restrict whole month
    </button>
  `,
})
class NamedAngularHarness {
  outsideMinimum: '2024-02-29' | '2024-03-01' | '2024-04-01' = '2024-02-29';
  minimumDate: '2024-03-30' | '2024-03-31' = '2024-03-30';
  count = 0;
  callbacks = 0;
  events = 0;
  readonly onButtonClick = () => {
    this.callbacks += 1;
  };
  query = '';
  projectedClass = '';
  selected = 'a';
  open = false;
  readonly closeEditor = () => {
    this.open = false;
  };
  mounted = true;
  readonly options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
}

const angularHost = document.createElement('named-angular-harness');
document.body.append(angularHost);
await bootstrapApplication(NamedAngularHarness);
mount(NamedSvelteHarness, { target: document.getElementById('svelte')! });
