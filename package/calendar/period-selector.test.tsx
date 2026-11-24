// @vitest-environment happy-dom
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { mountCalendarPeriodSelector } from './period-selector-native';

it('selects localized periods and updates controlled state', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const onChange = vi.fn();
  const options = [
    { value: 4, label: '4S', ariaLabel: 'Últimas cuatro semanas' },
    { value: 13, label: '13S', ariaLabel: 'Últimas trece semanas' },
  ];
  const props = { value: 13, options, onChange, ariaLabel: 'Período' };
  let selector: ReturnType<typeof mountCalendarPeriodSelector<number>>;
  act(() => { selector = mountCalendarPeriodSelector(host, props); });
  expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe('Período');
  const buttons = host.querySelectorAll('button');
  expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
  act(() => buttons[0].click());
  expect(onChange).toHaveBeenCalledWith(4, expect.anything(), expect.anything());
  act(() => selector.update({ ...props, value: 4 }));
  expect(host.querySelectorAll('button')[0].getAttribute('aria-pressed')).toBe('true');
  act(() => selector.destroy());
  expect(host.childElementCount).toBe(0);
  host.remove();
});
