import '@angular/compiler';
import { Component, ViewChild, type OnDestroy } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import {
  SvgButton,
  SearchInput,
  Dropdown,
  UiSlotDirective,
  Button,
  Panel,
} from './angular';
import { componentStyles } from './core/component-styles';
import { LookupField } from './preact';

@Component({
  selector: 'ui-projected-child',
  template: '<input data-projected-input value="Draft">',
})
class ProjectedChild implements OnDestroy {
  static destroyed = 0;
  ngOnDestroy() {
    ProjectedChild.destroyed += 1;
  }
}

@Component({
  selector: 'ui-named-angular-harness',
  imports: [
    SvgButton,
    SearchInput,
    Dropdown,
    UiSlotDirective,
    Button,
    Panel,
    ProjectedChild,
  ],
  template: `
    <rv-svg-button
      [label]="'Save ' + count"
      [visibleLabel]="'Save ' + count"
      [disabled]="disabled"
      [tabIndex]="count + 3"
      [aria-describedby]="'report-help'"
      (click)="count = count + 1"
      (clickEvent)="callbackCount = callbackCount + 1"
    />
    <button data-disable (click)="disabled = true">Disable save</button>
    <rv-search-input
      [value]="search"
      (valueChange)="search = $event"
      [placeholder]="'Find a report'"
      [attr.aria-label]="null"
      [aria-label]="'Search reports'"
      [disabled]="disabled"
    />
    <rv-button
      data-projected-button
      (click)="projectedCount = projectedCount + 1"
      >Save {{ projectedCount }}</rv-button
    >
    <rv-button data-conditional-button>
      @if (showConditional) {
        Later content
      }
    </rv-button>
    <button data-show-conditional (click)="showConditional = !showConditional">
      Toggle content
    </button>
    <rv-button data-explicit-button
      >Ignored fallback<ng-template rvUiSlot="default"
        >Explicit content</ng-template
      ></rv-button
    >
    <rv-panel [className]="'panel-' + count"><ui-projected-child /></rv-panel>
    <rv-dropdown
      [source]="source"
      [value]="value"
      (valueChange)="value = $event"
    >
      <ng-template rvUiSlot="option" let-option="option">
        <strong data-named-option>{{ option.label }}</strong>
      </ng-template>
    </rv-dropdown>
  `,
})
class NamedHarness {
  @ViewChild(SvgButton) saveButton!: SvgButton;
  count = 0;
  callbackCount = 0;
  projectedCount = 0;
  showConditional = false;
  disabled = false;
  search = '';
  value: unknown = 'a';
  source = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
  ];
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('named Angular components', () => {
  it('forwards direct props and native events without duplicating click callbacks', async () => {
    const host = document.createElement('ui-named-angular-harness');
    document.body.append(host);
    const app = await bootstrapApplication(NamedHarness);
    try {
      app.tick();
      await settle();
      const button = host.querySelector<HTMLButtonElement>('button')!;
      expect(
        app.components[0].instance.saveButton
          .getElement()
          ?.querySelector('button'),
      ).toBe(button);
      expect(button.tabIndex).toBe(3);
      expect(button.getAttribute('aria-describedby')).toBe('report-help');
      button.click();
      app.tick();
      await settle();
      expect(app.components[0].instance.count).toBe(1);
      expect(app.components[0].instance.callbackCount).toBe(1);
      expect(button.tabIndex).toBe(4);
      expect(button.getAttribute('aria-label')).toBe('Save 1');
      host.querySelector<HTMLButtonElement>('[data-disable]')!.click();
      app.tick();
      await settle();
      expect(button.disabled).toBe(true);
      expect(
        host.querySelector('rv-svg-button')!.hasAttribute('ngskiphydration'),
      ).toBe(true);
      const input = host.querySelector<HTMLInputElement>('input')!;
      expect(input.getAttribute('aria-label')).toBe('Search reports');
      expect(input.placeholder).toBe('Find a report');
      expect(input.disabled).toBe(true);
      input.value = 'Find report';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      app.tick();
      await settle();
      expect(app.components[0].instance.search).toBe('Find report');
    } finally {
      const control = app.components[0].instance.saveButton;
      app.destroy();
      expect(control.getElement()).toBeNull();
      host.remove();
    }
  });

  it('preserves framework-owned scoped slots and disposes open overlays', async () => {
    const host = document.createElement('ui-named-angular-harness');
    document.body.append(host);
    const app = await bootstrapApplication(NamedHarness);
    try {
      app.tick();
      await settle();
      host.querySelector<HTMLElement>('[role="combobox"]')!.click();
      await settle();
      app.tick();
      const beta = [
        ...document.querySelectorAll<HTMLElement>('[data-named-option]'),
      ].find((option) => option.textContent?.trim() === 'Beta')!;
      beta.click();
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

  it('projects ordinary Angular children once and preserves their state and lifecycle', async () => {
    const host = document.createElement('ui-named-angular-harness');
    document.body.append(host);
    const before = ProjectedChild.destroyed;
    const app = await bootstrapApplication(NamedHarness);
    try {
      app.tick();
      await settle();
      const button = host.querySelector<HTMLButtonElement>('rv-button button')!;
      expect(button.textContent?.trim()).toBe('Save 0');
      button.click();
      app.tick();
      await settle();
      expect(button.textContent?.trim()).toBe('Save 1');
      const explicit = host.querySelector<HTMLElement>(
        '[data-explicit-button]',
      )!;
      expect(explicit.querySelector('button')!.textContent?.trim()).toBe(
        'Explicit content',
      );
      expect(
        [...explicit.children].some(
          (child) =>
            (child as HTMLElement).style.display === 'none' &&
            child.textContent?.includes('Ignored fallback'),
        ),
      ).toBe(true);
      const conditional = host.querySelector<HTMLButtonElement>(
        '[data-conditional-button] button',
      )!;
      expect(conditional.textContent?.trim()).toBe('');
      host.querySelector<HTMLButtonElement>('[data-show-conditional]')!.click();
      app.tick();
      await settle();
      expect(conditional.textContent?.trim()).toBe('Later content');
      host.querySelector<HTMLButtonElement>('[data-show-conditional]')!.click();
      app.tick();
      await settle();
      expect(conditional.textContent?.trim()).toBe('');
      const input = host.querySelector<HTMLInputElement>(
        '[data-projected-input]',
      )!;
      input.value = 'Unsaved draft';
      input.focus();
      host.querySelector<HTMLButtonElement>('rv-svg-button button')!.click();
      app.tick();
      await settle();
      expect(host.querySelectorAll('[data-projected-input]')).toHaveLength(1);
      expect(input.value).toBe('Unsaved draft');
      expect(document.activeElement).toBe(input);
      app.destroy();
      expect(ProjectedChild.destroyed).toBe(before + 1);
    } finally {
      if (!app.destroyed) app.destroy();
      host.remove();
    }
  });

  it('registers the LookupField stylesheet families for all framework adapters', () => {
    expect(componentStyles(LookupField).map((sheet) => sheet.id)).toContain(
      'fields',
    );
    expect(componentStyles(LookupField).map((sheet) => sheet.id)).toContain(
      'layout',
    );
  });
});
