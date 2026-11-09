import '@angular/compiler';
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { UiComponent, UiSlotDirective } from './angular';

@Component({
  selector: 'ui-angular-harness',
  standalone: true,
  imports: [UiComponent, UiSlotDirective],
  template: `<rv-ui
      component="Dropdown"
      [props]="{ source: source, value: value }"
      (valueChange)="value = $any($event)"
    >
      <ng-template rvUiSlot="option" let-option="option"
        ><strong data-option>{{ option.label }}</strong></ng-template
      >
    </rv-ui>
    <button data-reset-search (click)="search = 'External'">
      Reset search
    </button>
    <rv-ui
      component="SearchInput"
      [props]="{ value: search }"
      (valueChange)="search = $any($event)"
    ></rv-ui>`,
})
class Harness {
  value = 'a';
  search = '';
  source = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
describe('Angular shared component host', () => {
  it('renders scoped Angular templates, emits controlled values and disposes overlays', async () => {
    const host = document.createElement('ui-angular-harness');
    document.body.append(host);
    const app = await bootstrapApplication(Harness);
    try {
      app.tick();
      await settle();
      host.querySelector<HTMLElement>('[role="combobox"]')!.click();
      await settle();
      app.tick();
      expect(document.querySelectorAll('[data-option]').length).toBe(2);
      const option = [
        ...document.querySelectorAll<HTMLElement>('[data-option]'),
      ].find((node) => node.textContent === 'Beta')!;
      option.click();
      await settle();
      app.tick();
      expect(app.components[0].instance.value).toBe('b');
      host.querySelector<HTMLElement>('[role="combobox"]')!.click();
      await settle();
      app.tick();
      app.destroy();
      await settle();
      expect(document.querySelector('[role="listbox"]')).toBeNull();
    } finally {
      if (!app.destroyed) app.destroy();
      host.remove();
    }
  });
  it('bridges SearchInput values in both directions without a callback inside props', async () => {
    const host = document.createElement('ui-angular-harness');
    document.body.append(host);
    const app = await bootstrapApplication(Harness);
    try {
      app.tick();
      await settle();
      const input = host.querySelector('input')!;
      input.value = 'Search text';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await settle();
      app.tick();
      expect(app.components[0].instance.search).toBe('Search text');
      host.querySelector<HTMLButtonElement>('[data-reset-search]')!.click();
      app.tick();
      await settle();
      expect(input.value).toBe('External');
    } finally {
      app.destroy();
      host.remove();
    }
  });
});
