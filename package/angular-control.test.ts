import '@angular/compiler';
import { ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { expect, it } from 'vitest';
import { UiControlDirective } from './angular-control';

function decorate(element: HTMLElement) {
  const injector = Injector.create({
    providers: [{ provide: ElementRef, useValue: new ElementRef(element) }],
  });
  return runInInjectionContext(injector, () => new UiControlDirective());
}

it('preserves Angular native state and consumer classes as control type and classes change', () => {
  const input = document.createElement('input');
  input.className = 'local';
  input.value = 'Draft';
  const directive = decorate(input);
  directive.ngDoCheck();
  expect(input.className).toBe('local rv-control');
  expect(input.value).toBe('Draft');
  input.type = 'checkbox';
  input.checked = true;
  input.disabled = true;
  input.className = 'updated';
  directive.ngDoCheck();
  expect(input.className).toBe('updated rv-checkbox');
  expect(input.checked).toBe(true);
  expect(input.disabled).toBe(true);
  input.type = 'text';
  directive.ngDoCheck();
  expect(input.className).toBe('updated rv-control');
});

it('uses standard button presentation while preserving explicit submit semantics', () => {
  const button = document.createElement('button');
  const directive = decorate(button);
  directive.ngDoCheck();
  expect(button.type).toBe('button');
  expect(button.className).toBe('rv-btn');
  button.type = 'submit';
  directive.ngDoCheck();
  expect(button.type).toBe('submit');
});
