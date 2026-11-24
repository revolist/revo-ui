import { expect, it, vi } from 'vitest';
import { renderProgressDetail, renderStatusAction } from './status-action';
const h = (tag: string, props: Record<string, unknown>, children?: unknown) => ({ tag, props, children });
it('renders translated action details and invokes the owner', () => {
  const onActivate = vi.fn();
  const result = renderStatusAction(h, { label: 'Cita confirmada', text: 'Confirmada', detail: '21 oct.', hasPopup: 'dialog', onActivate });
  const button = result.children[0];
  expect(button.props['aria-label']).toBe('Cita confirmada');
  expect(button.props['aria-haspopup']).toBe('dialog');
  button.props.onClick({});
  expect(onActivate).toHaveBeenCalledOnce();
  expect(renderStatusAction(h, { label: 'Sin cita', text: 'Sin cita', asText: true, onActivate }).tag).toBe('span');
});
it('labels its native progress indicator', () => {
  const result = renderProgressDetail(h, { value: 3, max: 6, label: '3 de 6', valueText: '3/6' });
  expect(result.children[0].children[0].props['aria-label']).toBe('3 de 6');
});
