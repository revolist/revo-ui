import { expect, it } from 'vitest';
import { calculateTooltipPosition } from './tooltip-surface';
const anchor = new DOMRect(100, 100, 60, 20);
const popup = new DOMRect(0, 0, 80, 30);
it('positions explicit sides, logical RTL alignment and offsets', () => {
  const right = calculateTooltipPosition(
    anchor,
    popup,
    { width: 400, height: 300 },
    { side: 'right', align: 'start', sideOffset: 12, alignOffset: 3 },
  );
  expect(right.left).toBe(172);
  expect(right.top).toBe(103);
  const rtl = calculateTooltipPosition(
    anchor,
    popup,
    { width: 400, height: 300 },
    { side: 'inline-start', direction: 'rtl', sideOffset: 12 },
  );
  expect(rtl.side).toBe('right');
});
it('flips and shifts inside a custom collision boundary', () => {
  const point = calculateTooltipPosition(
    anchor,
    popup,
    { width: 400, height: 300 },
    {
      side: 'left',
      collisionBoundary: new DOMRect(90, 50, 220, 200),
      collisionPadding: 10,
    },
  );
  expect(point.side).toBe('right');
  expect(point.left).toBeGreaterThanOrEqual(100);
  expect(point.left + popup.width).toBeLessThanOrEqual(300);
});
