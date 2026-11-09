import { h, render } from 'preact';
import { expect, it } from 'vitest';
import { Badge } from './controls';
import { badgeClassName } from './badge';

it('preserves the solid default and supports neutral/accent badges in both shapes', () => {
  expect(badgeClassName()).toContain('rv-badge--solid');
  const host = document.createElement('div');
  for (const variant of ['neutral', 'accent'] as const) {
    for (const shape of ['pill', 'rounded'] as const) {
      render(
        <Badge variant={variant} shape={shape}>
          0
        </Badge>,
        host,
      );
      expect(
        host.firstElementChild?.classList.contains(`rv-badge--${variant}`),
      ).toBe(true);
      expect(
        host.firstElementChild?.classList.contains(`rv-badge--${shape}`),
      ).toBe(true);
      expect(host.textContent).toBe('0');
    }
  }
  render(null, host);
});
