// @vitest-environment happy-dom
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  ConfiguratorSectionPanels,
  ConfiguratorSectionTabs,
  useConfiguratorSections,
  type ConfiguratorSectionsConfig,
} from './configurator-sections';

function Example(props: ConfiguratorSectionsConfig) {
  const navigation = useConfiguratorSections(props, [
    { id: 'layout', label: 'Layout' },
  ]);
  return (
    <>
      <ConfiguratorSectionTabs
        sections={navigation.sections}
        active={navigation.active}
        onChange={navigation.select}
        prefix="test"
        label="Configure"
      />
      <ConfiguratorSectionPanels
        sections={navigation.custom}
        active={navigation.active}
        prefix="test"
      />
    </>
  );
}
afterEach(() => {
  act(() => render(null, document.body));
  document.body.replaceChildren();
});

it('mounts custom content lazily, preserves it across tabs and releases it on removal', () => {
  const dispose = vi.fn();
  const mount = vi.fn((host: HTMLElement) => {
    host.textContent = 'Assistant';
    return dispose;
  });
  const change = vi.fn();
  act(() =>
    render(
      <Example
        sections={[{ id: 'ai', label: 'AI', mount }]}
        onSectionChange={change}
      />,
      document.body,
    ),
  );
  expect(mount).not.toHaveBeenCalled();
  const ai = document.querySelector<HTMLButtonElement>('#test-tab-ai')!;
  act(() => ai.click());
  const panel = document.querySelector<HTMLElement>('#test-panel-ai')!;
  expect(ai.getAttribute('aria-controls')).toBe(panel.id);
  expect(panel.getAttribute('aria-labelledby')).toBe(ai.id);
  expect(panel.textContent).toBe('Assistant');
  expect(change).toHaveBeenCalledWith('ai');
  act(() =>
    document.querySelector<HTMLButtonElement>('#test-tab-layout')!.click(),
  );
  expect(panel.hidden).toBe(true);
  expect(dispose).not.toHaveBeenCalled();
  act(() => ai.click());
  expect(mount).toHaveBeenCalledTimes(1);
  act(() => render(<Example sections={[]} />, document.body));
  expect(dispose).toHaveBeenCalledOnce();
  expect(
    document.querySelector('#test-tab-layout')!.getAttribute('aria-selected'),
  ).toBe('true');
});

it('honors initial selection, visibility, disabled state and reserved IDs', () => {
  act(() =>
    render(
      <Example
        initialSection="custom"
        sections={[
          { id: 'layout', label: 'Cannot replace Layout' },
          { id: 'hidden', label: 'Hidden', hidden: true },
          { id: 'blocked', label: 'Blocked', disabled: true },
          {
            id: 'custom',
            label: 'Custom',
            render: () => <input defaultValue="Draft" />,
          },
          { id: 'custom', label: 'Duplicate' },
        ]}
      />,
      document.body,
    ),
  );
  expect(
    [...document.querySelectorAll('[role="tab"]')].map(
      (tab) => tab.textContent,
    ),
  ).toEqual(['Layout', 'Blocked', 'Custom']);
  expect(
    document.querySelector<HTMLButtonElement>('#test-tab-blocked')!.disabled,
  ).toBe(true);
  expect(
    document.querySelector('#test-tab-custom')!.getAttribute('aria-selected'),
  ).toBe('true');
  const field = document.querySelector('input')!;
  field.value = 'Changed';
  act(() =>
    document.querySelector<HTMLButtonElement>('#test-tab-layout')!.click(),
  );
  act(() =>
    document.querySelector<HTMLButtonElement>('#test-tab-custom')!.click(),
  );
  expect(field.value).toBe('Changed');
});

it('keeps the selected panel and its draft mounted during a global disabled state', () => {
  function LoadingExample({ disabled }: { disabled: boolean }) {
    const navigation = useConfiguratorSections(
      { initialSection: 'chart' },
      [
        {
          id: 'chart',
          label: 'Chart',
          render: () => <input defaultValue="Draft" />,
        },
        { id: 'layout', label: 'Layout' },
      ],
      disabled,
    );
    return (
      <>
        <ConfiguratorSectionTabs
          sections={navigation.sections}
          active={navigation.active}
          onChange={navigation.select}
          prefix="loading"
          label="Configure"
        />
        <ConfiguratorSectionPanels
          sections={navigation.sections}
          active={navigation.active}
          prefix="loading"
        />
      </>
    );
  }
  act(() => render(<LoadingExample disabled={false} />, document.body));
  const field = document.querySelector('input')!;
  field.value = 'Unsaved';
  act(() => render(<LoadingExample disabled />, document.body));
  expect(
    document.querySelector<HTMLElement>('#loading-panel-chart')!.hidden,
  ).toBe(false);
  expect(
    document.querySelector('#loading-tab-chart')!.getAttribute('aria-selected'),
  ).toBe('true');
  act(() =>
    document.querySelector<HTMLButtonElement>('#loading-tab-layout')!.click(),
  );
  expect(
    document.querySelector<HTMLElement>('#loading-panel-chart')!.hidden,
  ).toBe(false);
  act(() => render(<LoadingExample disabled={false} />, document.body));
  expect(document.querySelector('input')).toBe(field);
  expect(field.value).toBe('Unsaved');
});
