import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchEntries } from '../src/global-search-index.ts';
const items = [
  {
    id: 'other',
    label: 'Calendar and dates',
    description: 'Date selection',
    href: '/calendar',
    kind: 'Family',
    keywords: 'mini calendar',
  },
  {
    id: 'mini',
    label: 'Mini calendar',
    description: 'Calendar and dates',
    href: '/mini',
    kind: 'Example',
  },
  {
    id: 'toast',
    label: 'Toaster',
    description: 'Status and feedback',
    href: '/toast',
    kind: 'Control',
  },
];
test('ranks exact matches and finds words in any order', () => {
  assert.equal(searchEntries(items, 'mini calendar')[0].id, 'mini');
  assert.equal(searchEntries(items, 'calendar mini')[0].id, 'mini');
});
test('finds prefixes and small typos without matching unrelated queries', () => {
  assert.equal(searchEntries(items, 'toast')[0].id, 'toast');
  assert(searchEntries(items, 'calender').some((item) => item.id === 'mini'));
  assert(searchEntries(items, 'calnedar').some((item) => item.id === 'mini'));
  assert.deepEqual(searchEntries(items, 'unrelated'), []);
});
