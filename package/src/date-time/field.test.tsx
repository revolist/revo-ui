import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it } from 'vitest';
import { DateTimeField, TemporalDraft } from './field';

const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
it('honors calendar-required mode when presenting draft actions', () => {
  act(() =>
    render(
      <TemporalDraft
        value="2026-10-12"
        options={{ calendar: { required: true } }}
        apply={() => {}}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('button')].some(
      (button) => button.textContent === 'Clear',
    ),
  ).toBe(false);
});
it('localizes both the time trigger and popup accessible name', () => {
  act(() =>
    render(
      <DateTimeField
        kind="time"
        value="09:00"
        picker={{ text: { chooseTime: 'Choisir une heure' } }}
      />,
      host,
    ),
  );
  const trigger = host.querySelector('button')!;
  expect(trigger.getAttribute('aria-label')).toBe('Choisir une heure');
  act(() => trigger.click());
  expect(
    document.querySelector('.rv-editor-popup')?.getAttribute('aria-label'),
  ).toBe('Choisir une heure');
});

it('shows adapter commit errors and clears them after a new draft or Clear', () => {
  act(() =>
    render(
      <TemporalDraft
        value="2026-10-12"
        options={{ autoApply: false }}
        apply={() => 'Timezone rejection'}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const button = (name: string) =>
    [...host.querySelectorAll('button')].find(
      (item) => item.textContent === name,
    )!;
  act(() => button('Apply').click());
  expect(host.querySelector('[role=alert]')?.textContent).toContain(
    'Timezone rejection',
  );
  act(() => button('Clear').click());
  expect(host.querySelector('[role=alert]')).toBeNull();
});
it('allows adapters such as Timeline to hide Clear without making the calendar required', () => {
  act(() =>
    render(
      <TemporalDraft
        value="2026-10-12"
        options={{}}
        clearable={false}
        apply={() => {}}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('button')].some(
      (button) => button.textContent === 'Clear',
    ),
  ).toBe(false);
});
it('defaults to automatic application and commits typed valid values with Enter', () => {
  const values: unknown[] = [];
  act(() =>
    render(
      <TemporalDraft
        value="2026-10-12"
        options={{}}
        apply={(value) => {
          values.push(value);
        }}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('button')].some(
      (button) => button.textContent === 'Apply',
    ),
  ).toBe(false);
  const input = host.querySelector('input')!;
  act(() => {
    input.focus();
    input.value = '2026-10-20';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(values).toEqual([]);
  act(() =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    ),
  );
  expect(values).toEqual(['2026-10-20']);
});
it('validates partial ranges before automatic calendar completion and supports manual mode', () => {
  const values: unknown[] = [];
  const select = (date: string) =>
    act(() =>
      (
        host.querySelector(
          `[data-calendar-date="${date}"]`,
        ) as HTMLButtonElement
      ).click(),
    );
  act(() =>
    render(
      <TemporalDraft
        value={{ from: '2026-10-12', to: '2026-10-17' }}
        options={{ selection: 'range' }}
        apply={(value) => {
          values.push(value);
        }}
        cancel={() => {}}
      />,
      host,
    ),
  );
  select('2026-10-20');
  expect(values).toEqual([]);
  select('2026-10-23');
  expect(values).toEqual([{ from: '2026-10-20', to: '2026-10-23' }]);
  act(() => render(null, host));
  values.length = 0;
  act(() =>
    render(
      <TemporalDraft
        value="2026-10-12"
        options={{ autoApply: false }}
        apply={(value) => {
          values.push(value);
        }}
        cancel={() => {}}
      />,
      host,
    ),
  );
  select('2026-10-20');
  expect(values).toEqual([]);
  act(() =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Apply')!
      .click(),
  );
  expect(values).toEqual(['2026-10-20']);
});
