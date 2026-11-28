import { h } from 'preact';
import { describe, expect, it, vi } from 'vitest';
import { withSvelteContent } from './svelte-adapter';

const snippet = (() => {}) as import('svelte').Snippet<
  [Record<string, unknown>]
>;

describe('named Svelte content bridge', () => {
  it('keeps scalars and native callbacks while bridging content snippets', () => {
    const onClick = vi.fn();
    const content = vi.fn(() => h('span'));
    const props = withSvelteContent(
      'SvgButton',
      { label: 'Save', iconContent: snippet, onClick },
      {},
      content,
    );
    expect(props.label).toBe('Save');
    expect(props.onClick).toBe(onClick);
    expect(content).toHaveBeenCalledWith(snippet);
    expect(props.iconContent).toHaveProperty('type', 'span');
  });

  it('maps direct dropdown render snippets to the existing scoped slot contract', () => {
    const content = vi.fn(() => h('span'));
    const props = withSvelteContent(
      'Dropdown',
      { renderOption: snippet },
      {},
      content,
    );
    const option = { label: 'One', value: 1 };
    (props.renderOption as Function)(h, option, true);
    expect(content).toHaveBeenCalledWith(snippet, { option, selected: true });
  });

  it('maps named calendar day slots to their scoped renderer', () => {
    const content = vi.fn(() => h('span'));
    const props = withSvelteContent(
      'CalendarPicker',
      {},
      { day: snippet },
      content,
    );
    const state = { selected: true, today: false };
    (props.renderDay as Function)('2026-10-15', state);
    expect(content).toHaveBeenCalledWith(snippet, {
      date: '2026-10-15',
      context: state,
    });
  });

  it('lets explicit slots override a direct render snippet', () => {
    const override = (() => {}) as typeof snippet;
    const content = vi.fn(() => h('span'));
    const props = withSvelteContent(
      'Dropdown',
      { renderOption: snippet },
      { option: override },
      content,
    );
    (props.renderOption as Function)(h, { value: 1 }, false);
    expect(content).toHaveBeenCalledWith(override, {
      option: { value: 1 },
      selected: false,
    });
  });

  it('preserves callback arguments for render props without a named scope mapping', () => {
    const content = vi.fn(() => h('span'));
    const props = withSvelteContent(
      'SegmentedSwitch',
      { renderOption: snippet },
      {},
      content,
    );
    (props.renderOption as Function)('option', { active: true });
    expect(content).toHaveBeenCalledWith(snippet, {
      args: ['option', { active: true }],
    });
  });
});
