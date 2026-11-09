import { expect, it } from 'vitest';
import {
  fieldDropIndex,
  fieldListDropIndex,
  reorderFields,
} from './field-reorder';

it('moves to original-list boundaries in both directions without losing repeated field instances', () => {
  const first = { prop: 'amount', id: 'sum' },
    second = { prop: 'amount', id: 'avg' },
    third = { prop: 'cost' };
  const source = [first, second, third];
  expect(reorderFields(source, 0, 3)).toEqual([second, third, first]);
  expect(reorderFields(source, 2, 0)).toEqual([third, first, second]);
  expect(reorderFields(source, 0, 2)[1]).toBe(first);
  expect(source).toEqual([first, second, third]);
  for (const [from, boundary] of [
    [0, 0],
    [0, 1],
    [-1, 2],
    [3, 0],
    [0, 4],
    [0, -1],
    [0.5, 2],
    [0, NaN],
  ])
    expect(reorderFields(source, from, boundary)).toBe(source);
});

it('retains the previous insertion side near the midpoint for vertical and horizontal adapters', () => {
  expect(fieldDropIndex(101, 100, 40, 2)).toBe(2);
  expect(fieldDropIndex(139, 100, 40, 2)).toBe(3);
  expect(fieldDropIndex(121, 100, 40, 2, 2)).toBe(2);
  expect(fieldDropIndex(119, 100, 40, 2, 3)).toBe(3);
  expect(fieldDropIndex(127, 100, 40, 2, 2, 6)).toBe(3);
});

it('keeps inter-row gaps at their adjacent boundary instead of jumping to the end', () => {
  const rows = [
    { top: 10, height: 20 },
    { top: 40, height: 20 },
    { top: 70, height: 20 },
  ];
  for (const previous of [null, 0, 1, 2, 3]) {
    expect(fieldListDropIndex(35, rows, previous)).toBe(1);
    expect(fieldListDropIndex(65, rows, previous)).toBe(2);
  }
  expect(fieldListDropIndex(5, rows)).toBe(0);
  expect(fieldListDropIndex(95, rows)).toBe(3);
  expect(fieldListDropIndex(51, rows, 1)).toBe(1);
  expect(fieldListDropIndex(49, rows, 2)).toBe(2);
  expect(fieldListDropIndex(0, [])).toBe(0);
});
