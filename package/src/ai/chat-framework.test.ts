import { expect, it } from 'vitest';
import { createElement as reactH, useState, act } from 'react';
import { createRoot } from 'react-dom/client';
import { createApp, h as vueH, ref, nextTick } from 'vue';
import * as reactUi from '../react';
import * as vueUi from '../vue';

const settle = async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 0));
  await nextTick();
};

it('composes React transcript children and submits the controlled composer without losing child state', async () => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  function Chat() {
    const [value, setValue] = useState('Hello');
    const [text, setText] = useState('Ready');
    return reactH(
      reactUi.AiChat,
      null,
      reactH(
        reactUi.AiChatContent,
        null,
        reactH(
          reactUi.AiMessage,
          { from: 'assistant' },
          reactH(reactUi.AiMessageContent, null, text),
        ),
      ),
      reactH(reactUi.AiChatComposer, {
        value,
        onValueChange: setValue,
        onSubmit: (next) => {
          setText(next);
          setValue('');
        },
      }),
    );
  }
  try {
    await act(async () => {
      root.render(reactH(Chat));
      await settle();
    });
    expect(host.querySelector('[role="log"]')?.textContent).toContain('Ready');
    await act(async () => {
      host
        .querySelector('form')!
        .dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true }),
        );
      await settle();
    });
    expect(host.querySelector('[role="log"]')?.textContent).toBe('Hello');
    expect(host.querySelector('textarea')!.value).toBe('');
  } finally {
    await act(async () => {
      root.unmount();
      await settle();
    });
    host.remove();
  }
});
it('composes Vue slots with composer v-model and updates the existing transcript', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const value = ref('Bonjour');
  const text = ref('Ready');
  const app = createApp({
    render: () =>
      vueH(
        vueUi.AiChat,
        {},
        {
          default: () => [
            vueH(
              vueUi.AiChatContent,
              {},
              {
                default: () =>
                  vueH(
                    vueUi.AiMessage,
                    { from: 'assistant' },
                    {
                      default: () =>
                        vueH(
                          vueUi.AiMessageContent,
                          {},
                          { default: () => text.value },
                        ),
                    },
                  ),
              },
            ),
            vueH(vueUi.AiChatComposer, {
              modelValue: value.value,
              'onUpdate:modelValue': (next: string) => {
                value.value = next;
              },
              onSubmit: (next: string) => {
                text.value = next;
                value.value = '';
              },
            }),
          ],
        },
      ),
  });
  try {
    app.mount(host);
    await settle();
    expect(host.querySelector('[role="log"]')?.textContent).toBe('Ready');
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await settle();
    expect(host.querySelector('[role="log"]')?.textContent).toBe('Bonjour');
    expect(host.querySelector('textarea')!.value).toBe('');
  } finally {
    app.unmount();
    await settle();
    host.remove();
  }
});
