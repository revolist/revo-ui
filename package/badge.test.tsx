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

it('applies a badge preset and respects explicit variants', () => {
  const host = document.createElement('div');
  render(
    <Badge
      preset={{
        className: 'custom',
        props: { variant: 'accent', shape: 'rounded' },
      }}
      variant="neutral"
    >
      Ready
    </Badge>,
    host,
  );
  const badge = host.querySelector('[data-part="root"]');
  expect(badge?.classList.contains('custom')).toBe(true);
  expect(badge?.classList.contains('rv-badge--neutral')).toBe(true);
  expect(badge?.classList.contains('rv-badge--rounded')).toBe(true);
  render(null, host);
});
