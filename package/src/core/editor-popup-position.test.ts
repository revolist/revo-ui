import { expect, it } from 'vitest';
import { calculateEditorPopupPosition } from './editor-popup-position';
const viewport = { width: 800, height: 500 };
it.each([
  [{ left: 10, right: 210, top: 40, bottom: 90 }, 'below', 94, 398],
  [{ left: 10, right: 210, top: 410, bottom: 460 }, 'above', 8, 398],
  [{ left: 10, right: 210, top: 190, bottom: 240 }, 'below', 244, 248],
  [{ left: 10, right: 210, top: 260, bottom: 310 }, 'above', 8, 248],
] as const)(
  'constrains tall popups beside their field without crossing it',
  (anchor, placement, top, maxHeight) => {
    const result = calculateEditorPopupPosition(
      anchor,
      { width: 300, height: 650 },
      viewport,
    );
    expect(result).toMatchObject({ placementY: placement, top, maxHeight });
    expect(
      result.top + Math.min(650, result.maxHeight) <= anchor.top - 4 ||
        result.top >= anchor.bottom + 4,
    ).toBe(true);
  },
);
it('keeps a compact popup below and retains viewport horizontal bounds', () => {
  expect(
    calculateEditorPopupPosition(
      { left: 700, right: 790, top: 190, bottom: 240 },
      { width: 300, height: 100 },
      viewport,
    ),
  ).toMatchObject({ top: 244, left: 490, placementY: 'below' });
});

it.each([
  [100, 244, 248],
  [380, 112, 484],
  [650, 8, 484],
])(
  'fits a viewport-aware popup of height %i within the viewport',
  (height, top, maxHeight) => {
    expect(
      calculateEditorPopupPosition(
        { left: 10, right: 210, top: 190, bottom: 240 },
        { width: 300, height },
        viewport,
        { fitViewport: true },
      ),
    ).toMatchObject({ top, maxHeight });
  },
);
