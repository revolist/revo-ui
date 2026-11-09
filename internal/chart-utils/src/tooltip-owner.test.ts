// @vitest-environment happy-dom
import { expect, it, vi } from 'vitest';
import { claimTooltip, releaseTooltip } from './tooltip-owner';

it('dismisses the previous tooltip across separately loaded product bundles', async () => {
  const first = {},
    second = {};
  const dismissFirst = vi.fn(() => releaseTooltip(document, first));
  claimTooltip(document, first, dismissFirst);
  vi.resetModules();
  const otherBundle = await import('./tooltip-owner');
  const dismissSecond = vi.fn();
  otherBundle.claimTooltip(document, second, dismissSecond);
  expect(dismissFirst).toHaveBeenCalledOnce();
  // Stale hides and destruction cannot release the current tooltip.
  releaseTooltip(document, first);
  claimTooltip(document, {}, () => {});
  expect(dismissSecond).toHaveBeenCalledOnce();
});

it('keeps repeated presentation, release, and separate documents independent', () => {
  const owner = {},
    dismiss = vi.fn();
  const otherDocument = document.implementation.createHTMLDocument();
  claimTooltip(document, owner, dismiss);
  claimTooltip(document, owner, dismiss);
  claimTooltip(otherDocument, {}, () => {});
  expect(dismiss).not.toHaveBeenCalled();
  releaseTooltip(document, owner);
  claimTooltip(document, {}, () => {});
  expect(dismiss).not.toHaveBeenCalled();
});
