import { expect, it } from 'vitest';
import { createSegmentedBarElement } from './segmented-bar-native';

it('creates an accessible segmented bar on a shared scale', () => {
  const bar = createSegmentedBarElement(document, { label: 'Dépenses', total: 100, parts: [{ value: 30, color: '#123456' }, { value: 20 }] });
  expect(bar.getAttribute('aria-label')).toBe('Dépenses');
  expect(bar.children).toHaveLength(2);
  expect((bar.children[0] as HTMLElement).style.width).toBe('30%');
  expect((bar.children[0] as HTMLElement).style.backgroundColor).toBe('#123456');
});
