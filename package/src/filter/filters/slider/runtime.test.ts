import { describe, expect, it } from 'vitest';
import { getTooltipCenterPosition, fillSlider } from './runtime';

describe('slider tooltip positioning', () => {
  it('keeps a fitting tooltip inside both control edges', () => {
    expect(getTooltipCenterPosition(0, 120, 40)).toBe(28);
    expect(getTooltipCenterPosition(50, 120, 40)).toBe(60);
    expect(getTooltipCenterPosition(100, 120, 40)).toBe(92);
  });

  it('centers a tooltip that is wider than its available control area', () => {
    expect(getTooltipCenterPosition(0, 40, 40)).toBe(20);
    expect(getTooltipCenterPosition(100, 40, 50)).toBe(20);
  });
});

it('uses shared theme colors without legacy filter variables', () => {
  const from = document.createElement('input'),
    to = document.createElement('input');
  document.body.append(from, to);
  try {
    for (const input of [from, to]) {
      input.type = 'range';
      input.min = '0';
      input.max = '100';
    }
    from.value = '20';
    to.value = '80';
    to.style.setProperty('--rv-ui-accent', '#2563eb');
    to.style.setProperty('--rv-ui-border', '#e0e0e0');
    fillSlider(from, to, to);
    expect(to.style.background).toMatch(/2563eb|37, 99, 235/);
    expect(to.style.background).not.toContain('25daa5');
    to.style.setProperty('--range-color', '#ff0000');
    fillSlider(from, to, to);
    expect(to.style.background).toMatch(/ff0000|255, 0, 0/);
  } finally {
    from.remove();
    to.remove();
  }
});
