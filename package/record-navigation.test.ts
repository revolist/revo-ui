import { expect, it, vi } from 'vitest';
import { createRecordNavigation } from './record-navigation';

it('uses localized labels and disables navigation at the first and last records', () => {
  const next = vi.fn();
  const root = createRecordNavigation(document, { index: 0, count: 2, label: '1 de 2', previousLabel: 'Anterior', nextLabel: 'Próximo', onPrevious: vi.fn(), onNext: next });
  const buttons = root.querySelectorAll('button');
  expect(buttons[0].disabled).toBe(true);
  expect(buttons[1].getAttribute('aria-label')).toBe('Próximo');
  buttons[1].click();
  expect(next).toHaveBeenCalledOnce();
});
