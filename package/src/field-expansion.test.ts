import { expect, it } from 'vitest';
import {
  createFieldExpansion,
  fieldExpansionIds,
  recordFieldExpansion,
} from './field-expansion';
it('reveals search matches while retaining collapsed branches and expanding new groups', () => {
  const state = createFieldExpansion();
  expect([...fieldExpansionIds(state, ['a', 'b'], false)]).toEqual(['a', 'b']);
  recordFieldExpansion(state, ['a']);
  expect([...fieldExpansionIds(state, ['a', 'b'], true)]).toEqual(['a', 'b']);
  expect([...fieldExpansionIds(state, ['a', 'b'], false)]).toEqual(['a']);
  expect([...fieldExpansionIds(state, ['a', 'b', 'c'], false)]).toEqual([
    'a',
    'c',
  ]);
});
