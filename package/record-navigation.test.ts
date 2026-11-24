import { expect, it, vi } from 'vitest';
import { createRecordNavigation } from './record-navigation';

it('uses localized labels and disables navigation at the first and last records', () => {
  const next = vi.fn();
  const root = createRecordNavigation(document, {
    index: 0,
    count: 2,
    label: '1 de 2',
    previousLabel: 'Anterior',
    nextLabel: 'Próximo',
    onPrevious: vi.fn(),
    onNext: next,
  });
  const buttons = root.querySelectorAll('button');
  expect(buttons[0].disabled).toBe(true);
  expect(buttons[1].getAttribute('aria-label')).toBe('Próximo');
  buttons[1].click();
  expect(next).toHaveBeenCalledOnce();
});

it('uses matching decorative chevrons and preserves custom button text', () => {
  const base = {
    index: 1,
    count: 3,
    label: '2 of 3',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    onPrevious: vi.fn(),
    onNext: vi.fn(),
  };
  const root = createRecordNavigation(document, base);
  const buttons = root.querySelectorAll('button');
  for (const button of buttons)
    expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
  expect(buttons[0].querySelector('path')?.getAttribute('d')).not.toBe(
    buttons[1].querySelector('path')?.getAttribute('d'),
  );
  const custom = createRecordNavigation(document, {
    ...base,
    previousText: 'Back',
    nextText: 'Next',
  });
  expect(
    [...custom.querySelectorAll('button')].map((button) => button.textContent),
  ).toEqual(['Back', 'Next']);
});
