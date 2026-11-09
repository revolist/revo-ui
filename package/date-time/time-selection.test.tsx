import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { TimeSelection } from './time-selection';
import { defaultTemporalPickerText } from './types';
const host = document.createElement('div');
afterEach(() => act(() => render(null, host)));
it('reuses labelled selection lists, honors constraints and emits complete valid times', () => {
  const change = vi.fn();
  act(() =>
    render(
      <TimeSelection
        value="09:30"
        label="Time"
        text={defaultTemporalPickerText}
        format="24h"
        min="09:30"
        max="11:00"
        step={900}
        onChange={change}
      />,
      host,
    ),
  );
  expect(host.querySelector('[aria-label="Time: Period"]')).toBeNull();
  expect(
    host.querySelector('[aria-label="Time: Hour"] [data-editor-value="23"]'),
  ).not.toBeNull();
  const hours = host.querySelector('[aria-label="Time: Hour"]')!;
  expect(
    hours.querySelector<HTMLButtonElement>('[data-editor-value="8"]')?.disabled,
  ).toBe(true);
  act(() =>
    hours.querySelector<HTMLButtonElement>('[data-editor-value="10"]')!.click(),
  );
  expect(change).toHaveBeenCalledWith('10:30');
  const minutes = host.querySelector('[aria-label="Time: Minute"]')!;
  expect(
    minutes.querySelector<HTMLButtonElement>('[data-editor-value="31"]')
      ?.disabled,
  ).toBe(true);
});
it('keeps empty selection keyboard reachable and exposes translated seconds/period labels', () => {
  act(() =>
    render(
      <TimeSelection
        value=""
        label="Heure"
        text={{
          ...defaultTemporalPickerText,
          hours: 'Heures',
          minutes: 'Minutes',
          seconds: 'Secondes',
          dayPeriod: 'Période',
        }}
        format="12h"
        precision="second"
        onChange={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelectorAll('[role="listbox"]')).toHaveLength(4);
  expect(
    host.querySelector('[aria-label="Heure: Heures"] [tabindex="0"]'),
  ).not.toBeNull();
  expect(host.querySelector('[aria-label="Heure: Secondes"]')).not.toBeNull();
  const period = host.querySelector('[aria-label="Heure: Période"]')!;
  expect(period).not.toBeNull();
  expect(
    period.parentElement?.querySelector('.rv-time-selection__label'),
  ).toBeNull();
  expect(host.querySelector('[aria-selected="true"]')).toBeNull();
});
