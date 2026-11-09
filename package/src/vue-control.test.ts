import { describe, expect, it } from 'vitest';
import {
  createApp,
  defineComponent,
  h,
  nextTick,
  ref,
  vModelCheckbox,
  withDirectives,
} from 'vue';
import { vRvControl } from './vue-control';

describe('Vue native shared controls', () => {
  it('keeps native input events and refs while updating control type and consumer classes', async () => {
    const type = ref('text');
    const consumerClass = ref('first');
    const input = ref<HTMLInputElement>();
    const value = ref('');
    const app = createApp(
      defineComponent({
        setup: () => () =>
          withDirectives(
            h('input', {
              ref: input,
              type: type.value,
              class: consumerClass.value,
              onInput: (event: Event) => {
                value.value = (event.target as HTMLInputElement).value;
              },
            }),
            [[vRvControl]],
          ),
      }),
    );
    const host = document.createElement('div');
    app.mount(host);
    expect(input.value).toBe(host.firstElementChild);
    expect(input.value!.className).toBe('first rv-control');
    input.value!.value = 'native value';
    input.value!.dispatchEvent(new Event('input'));
    expect(value.value).toBe('native value');
    type.value = 'checkbox';
    consumerClass.value = 'second';
    await nextTick();
    expect(input.value!.className).toBe('second rv-checkbox');
    app.unmount();
  });

  it('defaults buttons to actions and preserves explicit form submission', () => {
    const app = createApp({
      render: () =>
        h('form', [
          withDirectives(h('button', 'Action'), [[vRvControl]]),
          withDirectives(h('button', { type: 'submit' }, 'Submit'), [
            [vRvControl],
          ]),
        ]),
    });
    const host = document.createElement('div');
    app.mount(host);
    const buttons = host.querySelectorAll('button');
    expect(buttons[0].type).toBe('button');
    expect(buttons[1].type).toBe('submit');
    expect(buttons[0].className).toBe('rv-btn');
    app.unmount();
  });

  it('composes with Vue checkbox v-model in both directions', async () => {
    const checked = ref(false);
    const app = createApp({
      render: () =>
        withDirectives(
          h('input', {
            type: 'checkbox',
            'onUpdate:modelValue': (value: boolean) => {
              checked.value = value;
            },
          }),
          [[vModelCheckbox, checked.value], [vRvControl]],
        ),
    });
    const host = document.createElement('div');
    app.mount(host);
    const input = host.firstElementChild as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    expect(checked.value).toBe(true);
    await nextTick();
    checked.value = false;
    await nextTick();
    expect(input.checked).toBe(false);
    expect(input.classList.contains('rv-checkbox')).toBe(true);
    app.unmount();
  });
});
