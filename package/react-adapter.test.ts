import { afterEach, describe, expect, it } from 'vitest';
import {
  createContext,
  createElement as h,
  useContext,
  useState,
  act,
  StrictMode,
} from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { h as preactH } from 'preact';
import {
  Button,
  Dropdown,
  Switch,
  FieldGroupHeading,
  FieldGroup,
  FieldList,
  FieldRow,
  ActivityMessage,
  createReactAdapter,
} from './react';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root | undefined;
let host: HTMLDivElement;
const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};
afterEach(async () => {
  await act(async () => {
    root?.unmount();
    await settle();
  });
  root = undefined;
  host?.remove();
});
function setup() {
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
}

describe('React shared component adapters', () => {
  it('preserves React context and child state across parent prop updates and StrictMode remounts', async () => {
    setup();
    const Context = createContext('missing');
    function Child() {
      const value = useContext(Context);
      const [count, setCount] = useState(0);
      return h(
        'span',
        { onClick: () => setCount(count + 1), 'data-child': '' },
        `${value}:${count}`,
      );
    }
    const view = (disabled: boolean) =>
      h(
        StrictMode,
        null,
        h(
          Context.Provider,
          { value: 'context' },
          h(Button, { disabled }, h(Child)),
        ),
      );
    await act(async () => {
      root!.render(view(false));
      await settle();
    });
    expect(host.querySelector('[data-child]')?.textContent).toBe('context:0');
    await act(async () => {
      host.querySelector<HTMLElement>('[data-child]')!.click();
      await settle();
    });
    expect(host.querySelector('[data-child]')?.textContent).toBe('context:1');
    await act(async () => {
      root!.render(view(true));
      await settle();
    });
    expect(host.querySelector('[data-child]')?.textContent).toBe('context:1');
    expect(host.querySelector('button')!.disabled).toBe(true);
  });
  it('bridges render callbacks and disposes open dropdown overlays', async () => {
    setup();
    const values: string[] = [];
    await act(async () => {
      root!.render(
        h(Dropdown, {
          source: [{ value: 'a', label: 'Alpha' }],
          onChange: (value: any) => values.push(value),
          renderOption: (option: any) =>
            h('strong', { 'data-option': '' }, option.label),
        } as any),
      );
      await settle();
    });
    await act(async () => {
      host.querySelector<HTMLElement>('[role="combobox"]')!.click();
      await settle();
    });
    expect(document.querySelector('[data-option]')?.textContent).toBe('Alpha');
    await act(async () => {
      document.querySelector<HTMLElement>('[data-option]')!.click();
      await settle();
    });
    expect(values).toEqual(['a']);
    await act(async () => {
      host.querySelector<HTMLElement>('[role="combobox"]')!.click();
      await settle();
    });
    await act(async () => {
      root!.unmount();
      root = undefined;
      await settle();
    });
    expect(document.querySelector('[role="listbox"]')).toBeNull();
  });
  it('keeps dropdowns and controlled callback updates working', async () => {
    setup();
    function App() {
      const [checked, setChecked] = useState(false);
      const [value, setValue] = useState('a');
      return h(
        'div',
        null,
        h(Switch, { checked, onChange: setChecked, label: 'Enabled' }),
        h(Dropdown, {
          value,
          onChange: (next) => setValue(String(next)),
          source: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
        }),
      );
    }
    await act(async () => {
      root!.render(h(App));
      await settle();
    });
    await act(async () => {
      host.querySelector('button')!.click();
      await settle();
    });
    expect(host.querySelector('button')!.getAttribute('aria-checked')).toBe(
      'true',
    );
    const select = host.querySelector<HTMLElement>('[role=combobox]')!;
    expect(select.textContent).toContain('A');
    await act(async () => {
      select.click();
      await settle();
    });
    await act(async () => {
      document.querySelectorAll<HTMLElement>('[role=option]')[1].click();
      await settle();
    });
    expect(select.textContent).toContain('B');
  });
  it('preserves opaque application data identities instead of cloning remote contexts', async () => {
    setup();
    const context: any = {};
    context.self = context;
    const seen: unknown[] = [];
    const Adapted = createReactAdapter(
      ({ dataContext }: { dataContext: object }) => {
        seen.push(dataContext);
        return preactH('span', null, 'Context');
      },
      'ContextProbe',
    );
    await act(async () => {
      root!.render(h(Adapted, { dataContext: context }));
      await settle();
    });
    await act(async () => {
      root!.render(h(Adapted, { dataContext: context }));
      await settle();
    });
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((value) => value === context)).toBe(true);
  });

  it('bridges configurator and activity content props without passing React elements to Preact', async () => {
    setup();
    const clicks: string[] = [];
    const content = (label: string) =>
      h('button', { onClick: () => clicks.push(label) }, label);
    await act(async () => {
      root!.render(
        h(
          'div',
          null,
          h(FieldGroupHeading, { actions: content('Add') }, 'Fields'),
          h(FieldGroup, { heading: h('strong', null, 'Heading') }, 'Group'),
          h(FieldList, {
            empty: true,
            placeholder: h('em', null, 'No fields'),
          }),
          h(
            'ul',
            null,
            h(FieldRow, { indicator: content('Drop here') }, 'Row'),
          ),
          h(
            ActivityMessage,
            {
              avatar: h('b', null, 'Avatar'),
              timestamp: h('time', null, 'Now'),
              header: h('strong', null, 'Event'),
              details: h('span', null, 'Details'),
              actions: content('Inspect'),
            },
            'Message',
          ),
        ),
      );
      await settle();
    });
    expect(host.textContent).toContain('Heading');
    expect(host.textContent).toContain('No fields');
    expect(host.textContent).toContain('Avatar');
    expect(host.textContent).toContain('Details');
    await act(async () => {
      for (const button of host.querySelectorAll('button')) button.click();
      await settle();
    });
    expect(clicks).toEqual(['Add', 'Drop here', 'Inspect']);
  });
});

it('installs styles before application layout effects and supports explicit nonce/external CSS', async () => {
  const { useLayoutEffect } = await import('react');
  const { configureUiStyles } = await import('./core/component-styles');
  configureUiStyles({ nonce: 'explicit-nonce' });
  const Styled = createReactAdapter(
    () => preactH('button', null, 'Styled'),
    'Styled',
    {
      styles: [{ id: 'test-insertion', css: 'button {color: red}', order: 0 }],
    },
  );
  let observed = false;
  function App() {
    useLayoutEffect(() => {
      observed = !!document.querySelector(
        'style[data-rv-component-styles="test-insertion"]',
      );
    }, []);
    return h(Styled);
  }
  setup();
  await act(async () => {
    root!.render(h(App));
    await settle();
  });
  const style = document.querySelector(
    'style[data-rv-component-styles="test-insertion"]',
  );
  expect(observed).toBe(true);
  expect(style?.getAttribute('nonce')).toBe('explicit-nonce');
  await act(async () => {
    root!.render(null);
    await settle();
  });
  style?.remove();
  await act(async () => {
    configureUiStyles({ mode: 'external' });
    root!.render(h(Styled));
    await settle();
  });
  expect(
    document.querySelector('style[data-rv-component-styles="test-insertion"]'),
  ).toBeNull();
  expect(host.textContent).toContain('Styled');
  configureUiStyles({});
});
