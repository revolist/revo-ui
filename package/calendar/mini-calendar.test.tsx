import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { MiniCalendar } from './mini-calendar';

it('pages across leap day without changing the controlled selection', () => {
  const host = document.createElement('div');
  const onValueChange = vi.fn();
  try {
    act(() =>
      render(
        <MiniCalendar
          defaultStartDate="2028-02-28"
          referenceDate="2028-02-29"
          value={null}
          onValueChange={onValueChange}
          days={3}
        />,
        host,
      ),
    );
    expect(
      Array.from(host.querySelectorAll('[data-date]'), (day) =>
        day.getAttribute('data-date'),
      ),
    ).toEqual(['2028-02-28', '2028-02-29', '2028-03-01']);
    const leapDay = host.querySelector<HTMLButtonElement>(
      '[aria-current="date"]',
    )!;
    act(() => leapDay.click());
    expect(onValueChange).toHaveBeenCalledWith('2028-02-29');
    expect(leapDay.getAttribute('aria-pressed')).toBe('false');
  } finally {
    act(() => render(null, host));
  }
});

it('keeps all displayed dates valid at the upper civil calendar boundary', () => {
  const host = document.createElement('div');
  try {
    act(() =>
      render(
        <MiniCalendar
          defaultStartDate="9999-12-31"
          minDate="9999-12-31"
          days={3}
        />,
        host,
      ),
    );
    const days = Array.from(
      host.querySelectorAll<HTMLButtonElement>('[data-date]'),
    );
    expect(days.map((day) => day.dataset.date)).toEqual([
      '9999-12-29',
      '9999-12-30',
      '9999-12-31',
    ]);
    expect(days.map((day) => day.disabled)).toEqual([true, true, false]);
    expect(
      host.querySelectorAll('.rv-mini-calendar__navigation:disabled'),
    ).toHaveLength(2);
  } finally {
    act(() => render(null, host));
  }
});
