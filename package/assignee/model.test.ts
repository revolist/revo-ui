import { describe, expect, it } from 'vitest';
import {
  copyAssigneeAssignments,
  formatAssigneeLabel,
  reconcileAssigneeSelection,
  validAssigneeUnits,
} from './model';

describe('assignee allocation drafts', () => {
  it('omits only zero percentage suffixes from assignment labels', () => {
    expect(formatAssigneeLabel('Jordan Diaz', 0)).toBe('Jordan Diaz');
    expect(formatAssigneeLabel('Jordan Diaz', 100)).toBe('Jordan Diaz 100%');
    expect(formatAssigneeLabel('Jordan Diaz', 12.5)).toBe('Jordan Diaz 12.5%');
  });
  it('copies, deduplicates, and preserves unknown and differently typed IDs', () => {
    const source = [
      { value: 1, units: 100 },
      { value: '1', units: 50 },
      { value: 1, units: 75 },
      { value: 'missing', units: 0 },
    ];
    const draft = copyAssigneeAssignments(source);
    expect(draft).toEqual([
      { value: 1, units: 75 },
      { value: '1', units: 50 },
      { value: 'missing', units: 0 },
    ]);
    draft[0].units = 20;
    expect(source[2].units).toBe(75);
    expect(copyAssigneeAssignments(null)).toEqual([]);
  });
  it('preserves hidden, unknown and locked assignments while adding default units', () => {
    const previous = [
      { value: 'hidden', units: 25 },
      { value: 'unknown', units: 80 },
      { value: 'locked', units: 90 },
      { value: 'remove', units: 100 },
    ];
    const next = reconcileAssigneeSelection(
      previous,
      [
        { value: 'hidden' },
        { value: 'locked', disabled: true },
        { value: 'new' },
        { value: 'remove' },
        { value: 'disabled', disabled: true },
      ],
      new Set(['hidden', 'new', 'disabled']),
      50,
    );
    expect(next).toEqual([
      ...previous.slice(0, 3),
      { value: 'new', units: 50 },
    ]);
    expect(previous).toHaveLength(4);
  });
  it('accepts zero, fractional and overallocated percentages and rejects invalid numbers', () => {
    for (const value of [0, 0.5, 100, 250])
      expect(validAssigneeUnits(value)).toBe(true);
    for (const value of [-1, NaN, Infinity, -Infinity])
      expect(validAssigneeUnits(value)).toBe(false);
  });
});
