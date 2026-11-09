import { h, render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { Legend } from './legend';

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});

it('renders labelled keys with decorative markers', () => {
  render(
    <Legend
      label="Calendar key"
      className="consumer-legend"
      itemClassName="consumer-item"
      items={[
        { id: 'work', label: 'Working', marker: 'outline', color: '#123456' },
        { id: 'selected', label: 'Selected exception', tone: 'selected' },
        { id: 'inherited', label: 'Inherited schedule', marker: 'dashed' },
      ]}
    />,
    document.body,
  );
  const list = document.querySelector('[role="list"]')!;
  expect(list.getAttribute('aria-label')).toBe('Calendar key');
  expect(list.classList.contains('consumer-legend')).toBe(true);
  const items = list.querySelectorAll<HTMLElement>('[role="listitem"]');
  expect([...items].map((item) => item.textContent)).toEqual([
    'Working',
    'Selected exception',
    'Inherited schedule',
  ]);
  expect(items[0].style.getPropertyValue('--rv-legend-marker-color')).toBe(
    '#123456',
  );
  expect(items[0].classList.contains('consumer-item')).toBe(true);
  expect(items[1].dataset.tone).toBe('selected');
  expect(items[2].querySelector('i')?.dataset.marker).toBe('dashed');
  expect(list.querySelectorAll('i[aria-hidden="true"]')).toHaveLength(3);
});
