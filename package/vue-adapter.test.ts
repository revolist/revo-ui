import { describe, expect, it } from 'vitest';
import {
  createApp,
  h,
  nextTick,
  provide,
  inject,
  onUnmounted,
  onMounted,
  ref,
} from 'vue';
import {
  Button,
  Switch,
  Dropdown,
  TextInput,
  Panel,
  Tooltip,
  Dialog,
  Popover,
  SegmentedSwitch,
  Stepper,
  ChoiceChips,
} from './vue';

const settle = async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
};

describe('Vue shared component adapters', () => {
  it('passes original option objects to callbacks when nested slots are used', async () => {
    const option = { value: 'a', label: 'Alpha' };
    const received: unknown[] = [];
    const app = createApp({
      render: () =>
        h(
          ChoiceChips,
          {
            ariaLabel: 'Choices',
            options: [option],
            onChange: (_value, item) => received.push(item),
          },
          {
            optionLabel: ({ option: item }: any) =>
              h('strong', { 'data-choice': '' }, item.label),
          },
        ),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    try {
      await settle();
      host.querySelector<HTMLElement>('[data-choice]')!.click();
      await settle();
      expect(received).toEqual([option]);
      expect(received[0]).toBe(option);
      expect(option.label).toBe('Alpha');
    } finally {
      app.unmount();
      host.remove();
    }
  });
  it('keeps scoped step panels and their state through reorder and slot removal', async () => {
    const steps = ref([
      { id: 'a', label: 'Alpha' },
      { id: 'b', label: 'Beta' },
    ]);
    const selected = ref('a');
    const showSlot = ref(true);
    let released = 0;
    const Child = {
      props: ['id'],
      setup(props: { id: string }) {
        onUnmounted(() => released++);
        return () =>
          h('input', { 'data-step-input': props.id, value: props.id });
      },
    };
    const app = createApp({
      render: () =>
        h(
          Stepper,
          {
            label: 'Workflow',
            steps: steps.value,
            value: selected.value,
            onValueChange: (value) => {
              selected.value = value;
            },
          },
          showSlot.value
            ? {
                stepIcon: ({ step }: any) =>
                  h('b', { 'data-step-icon': step.id }, step.label),
                stepContent: ({ step }: any) => h(Child, { id: step.id }),
              }
            : {},
        ),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    try {
      await settle();
      expect(host.querySelectorAll('[data-step-icon]')).toHaveLength(2);
      const input = host.querySelector<HTMLInputElement>(
        '[data-step-input="a"]',
      )!;
      input.value = 'Draft';
      steps.value = [...steps.value].reverse();
      await settle();
      expect(host.querySelector('[data-step-input="a"]')).toBe(input);
      expect(input.value).toBe('Draft');
      showSlot.value = false;
      await settle();
      expect(host.querySelector('[data-step-input]')).toBeNull();
      expect(released).toBe(2);
    } finally {
      app.unmount();
      host.remove();
    }
  });
  it('renders scoped segmented options and counts using shared slot metadata', async () => {
    const selected = ref('a');
    const app = createApp({
      render: () =>
        h(
          SegmentedSwitch,
          {
            value: selected.value,
            options: [
              { value: 'a', label: 'Alpha', count: 2 },
              { value: 'b', label: 'Beta', count: 3 },
            ],
            onChange: (value) => {
              selected.value = String(value);
            },
          },
          {
            option: ({ option, state }: any) =>
              h(
                'strong',
                { 'data-option': '' },
                `${option.label}:${state.active}`,
              ),
            count: ({ option }: any) =>
              h('i', { 'data-count': '' }, String(option.count)),
          },
        ),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await settle();
    expect(
      [...host.querySelectorAll('[data-option]')].map(
        (node) => node.textContent,
      ),
    ).toEqual(['Alpha:true', 'Beta:false']);
    expect(host.querySelector('[data-count]')?.textContent).toBe('2');
    host.querySelectorAll('button')[1].click();
    await settle();
    expect(host.querySelectorAll('[data-option]')[1].textContent).toBe(
      'Beta:true',
    );
    app.unmount();
    expect(host.innerHTML).toBe('');
    host.remove();
  });
  it('renders Vue slot content with injection, updates it, and releases it on unmount', async () => {
    const label = ref('Save');
    const clicks = ref(0);
    let released = 0;
    const Child = {
      setup() {
        onUnmounted(() => released++);
        const prefix = inject('prefix');
        return () => h('strong', `${prefix}${label.value}`);
      },
    };
    const app = createApp({
      setup() {
        provide('prefix', 'Action: ');
        return () =>
          h(
            Button,
            { onClick: () => clicks.value++ },
            { default: () => h(Child) },
          );
      },
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await settle();
    expect(host.querySelector('button')?.textContent).toBe('Action: Save');
    host.querySelector('button')!.click();
    expect(clicks.value).toBe(1);
    label.value = 'Done';
    await settle();
    expect(host.querySelector('button')?.textContent).toBe('Action: Done');
    app.unmount();
    expect(host.innerHTML).toBe('');
    expect(released).toBe(1);
    host.remove();
  });

  it('keeps model values controlled and forwards both model updates and callbacks', async () => {
    const checked = ref(false);
    const changes: boolean[] = [];
    const app = createApp({
      render: () =>
        h(Switch, {
          modelValue: checked.value,
          label: 'Enabled',
          'onUpdate:modelValue': (value) => {
            checked.value = value as boolean;
          },
          onChange: (value) => changes.push(value),
        }),
    });
    const host = document.createElement('div');
    app.mount(host);
    await settle();
    host.querySelector('button')!.click();
    await settle();
    expect(checked.value).toBe(true);
    expect(changes).toEqual([true]);
    expect(host.querySelector('button')!.getAttribute('aria-checked')).toBe(
      'true',
    );
    checked.value = false;
    await settle();
    expect(host.querySelector('button')!.getAttribute('aria-checked')).toBe(
      'false',
    );
    app.unmount();
  });

  it('updates text models using native input events', async () => {
    const value = ref('initial');
    const app = createApp({
      render: () =>
        h(TextInput, {
          modelValue: value.value,
          'onUpdate:modelValue': (next) => {
            value.value = next as string;
          },
        }),
    });
    const host = document.createElement('div');
    app.mount(host);
    await settle();
    const input = host.querySelector('input')!;
    input.value = 'edited';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await settle();
    expect(value.value).toBe('edited');
    value.value = 'external';
    await settle();
    expect(input.value).toBe('external');
    app.unmount();
  });

  it('bridges scoped dropdown options and removes the popup when unmounted', async () => {
    const value = ref('a');
    const app = createApp({
      render: () =>
        h(
          Dropdown,
          {
            source: [
              { value: 'a', label: 'Alpha' },
              { value: 'b', label: 'Beta' },
            ],
            modelValue: value.value,
            'onUpdate:modelValue': (next) => {
              value.value = next as string;
            },
          },
          {
            option: ({ option }: any) =>
              h('b', { 'data-option': option.value }, option.label),
          },
        ),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await settle();
    host.querySelector<HTMLElement>('[role="combobox"]')!.click();
    await settle();
    expect(document.body.querySelector('[data-option="b"]')?.textContent).toBe(
      'Beta',
    );
    document.body.querySelector<HTMLElement>('[data-option="b"]')!.click();
    await settle();
    expect(value.value).toBe('b');
    host.querySelector<HTMLElement>('[role="combobox"]')!.click();
    await settle();
    app.unmount();
    await settle();
    expect(document.body.querySelector('[role="listbox"]')).toBeNull();
    host.remove();
  });
  it('binds dropdown choices through the Vue model', async () => {
    const value = ref('a');
    const app = createApp({
      render: () =>
        h(Dropdown, {
          modelValue: value.value,
          'onUpdate:modelValue': (next) => {
            value.value = String(next);
          },
          source: [
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
          ],
        }),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await settle();
    host.querySelector<HTMLElement>('[role=combobox]')!.click();
    await settle();
    document.querySelectorAll<HTMLElement>('[role=option]')[1].click();
    await settle();
    expect(value.value).toBe('b');
    expect(host.querySelector('select')).toBeNull();
    app.unmount();
    host.remove();
  });

  it('preserves slot component state, input identity and focus across wrapper prop updates', async () => {
    const label = ref('Before');
    let mounts = 0;
    let unmounts = 0;
    const Child = {
      setup() {
        onMounted(() => mounts++);
        onUnmounted(() => unmounts++);
        const value = ref('Initial');
        return () =>
          h('input', {
            value: value.value,
            onInput: (event: Event) => {
              value.value = (event.target as HTMLInputElement).value;
            },
          });
      },
    };
    const app = createApp({
      render: () =>
        h(Panel, { label: label.value }, { default: () => h(Child) }),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await settle();
    try {
      const input = host.querySelector('input')!;
      input.value = 'Draft';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
      label.value = 'After';
      await settle();
      expect(host.querySelector('input')).toBe(input);
      expect(input.value).toBe('Draft');
      expect(document.activeElement).toBe(input);
      expect(mounts).toBe(1);
      expect(unmounts).toBe(0);
    } finally {
      app.unmount();
      host.remove();
    }
    expect(unmounts).toBe(1);
  });

  it('associates a tooltip with its teleported button and releases the binding', async () => {
    const app = createApp({
      render: () =>
        h(
          Tooltip,
          { text: 'Details' },
          {
            default: () =>
              h('button', { 'aria-describedby': 'existing-hint' }, 'Help'),
          },
        ),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await settle();
    const button = host.querySelector('button')!;
    try {
      button.focus();
      await settle();
      const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');
      expect(tooltip?.textContent).toBe('Details');
      expect(button.getAttribute('aria-describedby')?.split(' ')).toEqual([
        'existing-hint',
        tooltip!.id,
      ]);
      button.blur();
      await settle();
      expect(button.getAttribute('aria-describedby')).toBe('existing-hint');
    } finally {
      app.unmount();
      host.remove();
    }
    expect(document.querySelector('[role="tooltip"]')).toBeNull();
  });

  it('adds and removes a default slot without attribute changes', async () => {
    const show = ref(false);
    const clicks: string[] = [];
    const app = createApp({
      render: () =>
        h(
          Button,
          null,
          show.value
            ? {
                default: () =>
                  h(
                    'span',
                    { onClick: () => clicks.push('clicked') },
                    'Conditional content',
                  ),
              }
            : {},
        ),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await settle();
    try {
      expect(host.textContent).toBe('');
      show.value = true;
      await settle();
      expect(host.textContent).toBe('Conditional content');
      host
        .querySelector('span[data-rv-vue-slot] span')
        ?.dispatchEvent(new Event('click', { bubbles: true }));
      expect(clicks).toEqual(['clicked']);
      show.value = false;
      await settle();
      expect(host.textContent).toBe('');
    } finally {
      app.unmount();
      host.remove();
    }
  });

  it('removes and restores a named footer without remounting the default slot', async () => {
    const footer = ref(true);
    const attrs = {
      open: true,
      title: 'Conditional dialog',
      closeLabel: 'Close',
      onClose: () => {},
    };
    const app = createApp({
      render: () =>
        h(Dialog, attrs, {
          default: () => h('input', { 'aria-label': 'Draft' }),
          ...(footer.value
            ? {
                footer: () =>
                  h('button', { 'data-conditional-save': '' }, 'Save'),
              }
            : {}),
        }),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    await settle();
    try {
      const input = document.querySelector<HTMLInputElement>(
        'input[aria-label="Draft"]',
      )!;
      input.value = 'Retained draft';
      input.focus();
      expect(document.querySelector('[data-conditional-save]')).not.toBeNull();
      footer.value = false;
      await settle();
      expect(document.querySelector('[data-conditional-save]')).toBeNull();
      expect(document.querySelector('input[aria-label="Draft"]')).toBe(input);
      expect(input.value).toBe('Retained draft');
      expect(document.activeElement).toBe(input);
      footer.value = true;
      await settle();
      expect(document.querySelector('[data-conditional-save]')).not.toBeNull();
      expect(document.querySelector('input[aria-label="Draft"]')).toBe(input);
    } finally {
      app.unmount();
      host.remove();
    }
  });
});

it('forwards Vue popover dismissal props and reactive kebab-case updates', async () => {
  const anchor = document.createElement('button');
  document.body.append(anchor);
  const host = document.createElement('div');
  document.body.append(host);
  const open = ref(true);
  const dismiss = ref(false);
  let closed = 0;
  const app = createApp({
    render: () =>
      h(
        Popover,
        {
          open: open.value,
          anchor,
          'close-on-outside': dismiss.value,
          'close-on-escape': dismiss.value,
          onClose: () => {
            closed++;
            open.value = false;
          },
        },
        { default: () => h('button', 'Popover action') },
      ),
  });
  try {
    app.mount(host);
    await settle();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    document
      .querySelector<HTMLButtonElement>('.rv-popover button')!
      .dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
    await settle();
    expect(closed).toBe(0);
    dismiss.value = true;
    await settle();
    expect(closed).toBe(0);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await settle();
    expect(closed).toBe(1);
    expect(open.value).toBe(false);
    expect(document.querySelector<HTMLElement>('.rv-popover')!.hidden).toBe(
      true,
    );
  } finally {
    app.unmount();
    host.remove();
    anchor.remove();
  }
});

it('applies the same portable Switch preset through Vue', async () => {
  const preset = JSON.parse(
    '{"className":"shared-switch","props":{"labelPosition":"after"},"tokens":{"trackWidth":"48px"}}',
  );
  const app = createApp({
    render: () => h(Switch, { label: 'Alerts', modelValue: true, preset }),
  });
  const host = document.createElement('div');
  document.body.append(host);
  app.mount(host);
  await settle();
  const button = host.querySelector('button')!;
  expect(button.classList.contains('shared-switch')).toBe(true);
  expect(button.firstElementChild?.getAttribute('data-part')).toBe('track');
  expect(
    button.style.getPropertyValue('--rv-ui-switch-preset-track-width'),
  ).toBe('48px');
  app.unmount();
  host.remove();
});
