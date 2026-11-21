import { expect, it } from 'vitest';
import {
  advanceAngle,
  angleFromPoint,
  pointOnDial,
  snapAngle,
  stepAngle,
} from './circular-slider-geometry';

it('uses clockwise degrees with zero at twelve o’clock', () => {
  expect([
    angleFromPoint(0, -1),
    angleFromPoint(1, 0),
    angleFromPoint(0, 1),
    angleFromPoint(-1, 0),
  ]).toEqual([0, 90, 180, 270]);
  expect(pointOnDial(10, 5, 90).x).toBeCloseTo(15);
  expect(pointOnDial(10, 5, 0).y).toBeCloseTo(5);
});

it('keeps a continuous drag from jumping between the endpoints', () => {
  expect(advanceAngle(350, 350, 5)).toBe(360);
  expect(advanceAngle(7, 7, 354)).toBe(0);
  expect(advanceAngle(360, 4, 355)).toBe(351);
});

it('supports decimal steps and works back from an uneven endpoint', () => {
  expect(snapAngle(22.58, 0.2)).toBe(22.6);
  expect(snapAngle(357, 50)).toBe(360);
  expect(stepAngle(360, 50, -1)).toBe(350);
  expect(stepAngle(350, 50, 1)).toBe(360);
  expect(stepAngle(37, 5, -1)).toBe(35);
});
