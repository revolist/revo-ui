// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { Checkbox } from '.';

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});

it('applies presets to labeled and standalone checkboxes', () => {
  render(
    <>
      <Checkbox
        label="Option"
        preset={{ className: 'custom', props: { disabled: true } }}
        disabled={false}
      />
      <Checkbox preset={{ className: 'custom', props: { disabled: true } }} />
    </>,
    document.body,
  );
  const [labeled, standalone] = document.querySelectorAll('input');
  expect(labeled.disabled).toBe(false);
  expect(standalone.disabled).toBe(true);
  expect(
    labeled.closest('[data-part="root"]')?.classList.contains('custom'),
  ).toBe(true);
  expect(standalone.classList.contains('custom')).toBe(true);
  expect(labeled.classList.contains('custom')).toBe(false);
});
