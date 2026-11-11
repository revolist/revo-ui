// @vitest-environment node
import { readFileSync } from 'node:fs';
import { TOOLTIP_STYLES } from './tooltip-surface';
import { expect, it } from 'vitest';
import { Window } from 'happy-dom';
import { ensureTooltipStyles } from './tooltip-surface';

it('installs styles in isolated owner documents without leaving browser globals', async () => {
  const window = new Window();
  try {
    expect(typeof globalThis.document).toBe('undefined');
    const document = window.document as unknown as Document;
    ensureTooltipStyles(document);
    ensureTooltipStyles(document);
    expect(
      document.head.querySelectorAll('[data-rv-tooltip-styles]'),
    ).toHaveLength(1);
    const shadow = document.body
      .appendChild(document.createElement('div'))
      .attachShadow({ mode: 'open' });
    ensureTooltipStyles(shadow);
    ensureTooltipStyles(shadow);
    expect(shadow.querySelectorAll('[data-rv-tooltip-styles]')).toHaveLength(1);
    expect(typeof globalThis.document).toBe('undefined');
  } finally {
    await window.happyDOM.close();
  }
});

it('keeps extracted tooltip CSS aligned with its runtime owner', () => {
  expect(
    readFileSync(new URL('./tooltip.css', import.meta.url), 'utf8').trim(),
  ).toBe(TOOLTIP_STYLES.trim());
});

it('accepts style configuration during SSR without a browser document', async () => {
  const { configureUiStyles } = await import('./component-styles');
  expect(typeof document).toBe('undefined');
  expect(() => configureUiStyles({ nonce: 'request-nonce' })).not.toThrow();
});
