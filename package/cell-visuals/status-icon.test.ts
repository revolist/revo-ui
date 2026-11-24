import { expect, it } from 'vitest';
import { renderStatusIcon } from './status-icon';

it('renders distinct decorative icons for each status', () => {
  const h = (tag: unknown, props: unknown, children?: unknown) => ({ tag, props, children });
  for (const kind of ['not-started', 'pending', 'passed', 'failed'] as const) {
    const icon = renderStatusIcon(h, kind) as any;
    expect(icon.tag).toBe('svg');
    expect(icon.props.class).toContain(`rv-status-icon--${kind}`);
    expect(icon.props['aria-hidden']).toBe('true');
    expect(icon.children).toHaveLength(kind === 'not-started' ? 1 : 2);
  }
});
