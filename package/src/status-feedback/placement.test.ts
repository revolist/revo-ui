import { expect, it } from 'vitest';
import { statusFeedbackSize } from './placement';

it('keeps the disclosure visible even when its board is short', () => {
  expect(
    statusFeedbackSize(
      { width: 800, height: 600 },
      { width: 600, height: 80 },
      true,
      {},
    ).maxHeight,
  ).toBeGreaterThanOrEqual(48);
});
it.each([true, false])(
  'keeps %s compact mode inside narrow viewports',
  (collapsed) => {
    const result = statusFeedbackSize(
      { width: 200, height: 60 },
      { width: 500, height: 800 },
      collapsed,
      {},
    );
    expect(result.width).toBeLessThanOrEqual(184);
    expect(result.maxHeight).toBeLessThanOrEqual(44);
  },
);
