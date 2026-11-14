import { describe, expect, it } from 'vitest';
import { calculateFloatingEditorPosition } from './anchored-popover';
const viewport = { width: 1400, height: 1000 };
const popup = { width: 420, height: 500 };
const bounds = { left: 200, right: 1200, top: 150, bottom: 850 };
describe('floating editor placement', () => {
  it('prefers the right side without covering the anchor', () => {
    expect(
      calculateFloatingEditorPosition(
        { left: 300, right: 400, top: 350, bottom: 450 },
        popup,
        viewport,
        { bounds },
      ),
    ).toEqual({ left: 408, top: 150, placement: 'right' });
  });
  it('uses the left side when the right side is full', () => {
    expect(
      calculateFloatingEditorPosition(
        { left: 1100, right: 1200, top: 350, bottom: 450 },
        popup,
        viewport,
        { bounds },
      ),
    ).toEqual({ left: 672, top: 150, placement: 'left' });
  });
  it('centers full-day editors in the calendar bounds', () => {
    expect(
      calculateFloatingEditorPosition(
        { left: 200, right: 1200, top: 200, bottom: 250 },
        popup,
        viewport,
        { bounds, preferCenter: true },
      ),
    ).toEqual({ left: 490, top: 250, placement: 'center' });
  });
  it('centers when neither side fits inside the calendar', () => {
    expect(
      calculateFloatingEditorPosition(
        { left: 450, right: 1150, top: 350, bottom: 450 },
        popup,
        viewport,
        { bounds },
      ),
    ).toEqual({ left: 490, top: 250, placement: 'center' });
  });
  it('keeps a low event popup within the calendar vertically', () => {
    expect(
      calculateFloatingEditorPosition(
        { left: 300, right: 400, top: 780, bottom: 820 },
        popup,
        viewport,
        { bounds },
      ).top,
    ).toBe(350);
  });
  it('keeps a narrow centered popup within the viewport', () => {
    const result = calculateFloatingEditorPosition(
      { left: 50, right: 90, top: 350, bottom: 400 },
      { width: 360, height: 510 },
      { width: 390, height: 844 },
      { bounds: { left: 24, right: 366, top: 200, bottom: 820 } },
    );
    expect(result.placement).toBe('center');
    expect(result.left).toBeGreaterThanOrEqual(12);
    expect(result.left + 360).toBeLessThanOrEqual(378);
    expect(result.top + 510).toBeLessThanOrEqual(832);
  });
});
