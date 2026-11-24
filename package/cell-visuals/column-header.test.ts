import { expect, it, vi } from 'vitest';
import { renderColumnHeader } from './column-header';
const h = (tag: string, props: Record<string, unknown>, children?: unknown) => ({ tag, props, children });
it('renders localized labels and forwards the header action', () => {
  const onActivate = vi.fn();
  const header = renderColumnHeader(h, { label: 'Región', subtitle: 'Por país', action: { label: 'Expandir', content: () => '+', onActivate } });
  expect(header.children[0].children).toBe('Región');
  expect(header.children[1]?.children).toBe('Por país');
  expect(header.children[2]?.props['aria-label']).toBe('Expandir');
  header.children[2]?.props.onClick({});
  expect(onActivate).toHaveBeenCalledOnce();
});
