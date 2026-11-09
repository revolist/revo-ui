import { describe, expect, it } from 'vitest';
import { h } from 'preact';
import { createFrameworkMount, type UiContentTarget } from './framework-mount';

describe('framework content lifecycle', () => {
  it('retains target identity across prop updates and rejects updates after disposal', () => {
    const host = document.createElement('div');
    let targets: UiContentTarget<string>[] = [];
    const mount = createFrameworkMount<string>(host, (next) => {
      targets = next;
    });
    const Component = ({ children, disabled }: any) =>
      h('button', { disabled }, children);
    const update = (text: string, disabled: boolean) =>
      mount.render(Component, { disabled }, (props, content) => ({
        ...props,
        children: content(text),
      }));
    update('First', false);
    const first = targets[0];
    expect(first).toBeDefined();
    update('Next', true);
    expect(targets[0].id).toBe(first.id);
    expect(targets[0].element).toBe(first.element);
    expect(targets[0].content).toBe('Next');
    mount.destroy();
    mount.destroy();
    expect(host.innerHTML).toBe('');
    expect(() => update('Late', false)).toThrow('destroyed');
  });
});
