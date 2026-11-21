import { expect, it } from 'vitest';
import { compareHistoryCells } from './cell-changes';

it('compares values by stable sheet-aware IDs and preserves the selected snapshot order', () => {
  const same = { id: 'sales-a1', address: 'A1', sheet: 'Sales', value: '12' };
  const updated = { id: 'cost-a1', address: 'A1', sheet: 'Cost', value: '8' };
  const added = { id: 'sales-a2', address: 'A2', sheet: 'Sales', value: '0' };
  const removed = {
    id: 'sales-c1',
    address: 'C1',
    sheet: 'Sales',
    value: 'Paid',
  };
  expect(
    compareHistoryCells(
      [same, { ...updated, value: '9' }, removed],
      [updated, added, { ...same, address: 'A3' }],
    ),
  ).toEqual([
    { cell: updated, before: '9', after: '8' },
    { cell: added, before: null, after: '0' },
    { cell: removed, before: 'Paid', after: null },
  ]);
});

it('treats omitted cells like null without treating zero or empty strings as null', () => {
  const empty = { id: '1', address: 'A1', value: null };
  expect(compareHistoryCells([empty], [])).toEqual([]);
  expect(compareHistoryCells([], [{ ...empty, value: '' }])).toEqual([
    { cell: { ...empty, value: '' }, before: null, after: '' },
  ]);
});
