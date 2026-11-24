import { expect, it } from 'vitest';
import { renderDateSlotHeader, renderTimeRangeHeader } from './time-range-header';
const h = (tag: string, props: Record<string, unknown>, children?: unknown) => ({ tag, props, children });
it('renders caller-provided localized date labels', () => {
  const header = renderDateSlotHeader(h, { day: '29', weekday: 'jeu.', label: '29 février' });
  expect(header.props.title).toBe('29 février');
  expect(header.children.map(child => child.children)).toEqual(['29', 'jeu.']);
});

it('positions month labels from the inline start for either text direction', () => {
  const header = renderTimeRangeHeader(h, ['Jan', 'Feb'], 'around', [25, 75]);
  expect(header.children.map((child: any) => child.props.style.insetInlineStart)).toEqual(['25%', '75%']);
});
