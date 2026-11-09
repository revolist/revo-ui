import { h, render, type ComponentChildren } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  AiChat,
  AiChatContent,
  AiChatComposer,
  AiChatEmptyState,
  AiMessage,
  AiMessageContent,
  AiMessageActions,
  AiReasoning,
  AiTask,
  AiTaskItem,
} from './chat';
import { AiChangePreview } from './components';
import { Button } from '../controls';

let host: HTMLDivElement;
function mount(view: ComponentChildren) {
  host ??= document.createElement('div');
  document.body.append(host);
  return act(() => render(view, host));
}
afterEach(async () => {
  if (host) {
    await act(() => render(null, host));
    host.remove();
  }
  vi.unstubAllGlobals();
});
it('composes transcript, safe message text, custom actions and the existing approval control', async () => {
  const apply = vi.fn();
  const action = vi.fn();
  await mount(
    <AiChat>
      <AiChatContent>
        <AiMessage from="user">
          <AiMessageContent>
            {'<script>doSomething()</script>'}
          </AiMessageContent>
        </AiMessage>
        <AiMessage from="assistant">
          <AiMessageContent>Proposed change</AiMessageContent>
          <AiMessageActions>
            <Button onClick={action}>Retry</Button>
          </AiMessageActions>
          <AiChangePreview
            summary="Review amount"
            onApply={apply}
            onCancel={() => {}}
          />
        </AiMessage>
      </AiChatContent>
    </AiChat>,
  );
  expect(host.querySelector('[role="log"]')?.getAttribute('aria-label')).toBe(
    'Conversation messages',
  );
  expect(host.querySelector('script')).toBeNull();
  expect(host.textContent).toContain('<script>doSomething()</script>');
  await act(() =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Retry')!
      .click(),
  );
  await act(() =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Apply changes')!
      .click(),
  );
  expect(action).toHaveBeenCalledTimes(1);
  expect(apply).toHaveBeenCalledTimes(1);
});
it('auto-opens streaming summaries and closes on completion unless the user chose otherwise', async () => {
  const view = (streaming: boolean) => (
    <AiReasoning isStreaming={streaming}>Published summary</AiReasoning>
  );
  await mount(view(true));
  expect(host.querySelector('details')!.open).toBe(true);
  await mount(view(false));
  expect(host.querySelector('details')!.open).toBe(false);
  await mount(view(true));
  const details = host.querySelector('details')!;
  await act(() => {
    details.open = false;
    details.dispatchEvent(new Event('toggle'));
  });
  await mount(view(false));
  await mount(view(true));
  expect(details.open).toBe(false);
});
it('supports controlled trace disclosure and status text without relying only on color', async () => {
  const change = vi.fn();
  await mount(
    <AiTask title="Read rows" status="error" open={false} onOpenChange={change}>
      <AiTaskItem status="error">Request failed</AiTaskItem>
    </AiTask>,
  );
  const details = host.querySelector('details')!;
  await act(() => {
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
  });
  expect(change).toHaveBeenCalledWith(true);
  expect(details.open).toBe(false);
  expect(host.textContent).toContain('Failed');
  await mount(
    <AiTask title="Read rows" open={true}>
      Results
    </AiTask>,
  );
  expect(host.querySelector('details')).toBe(details);
  expect(details.open).toBe(true);
});
it('uses chat defaults with the existing controlled composer and host translations', async () => {
  const submit = vi.fn();
  await mount(
    <AiChat translations={{ 'AI chat': 'Discussion' }}>
      <AiChatEmptyState title="Welcome" />
      <AiChatComposer
        value="Hello"
        onValueChange={() => {}}
        onSubmit={submit}
        translations={{ Message: 'Nachricht' }}
      />
    </AiChat>,
  );
  expect(host.querySelector('section')?.getAttribute('aria-label')).toBe(
    'Discussion',
  );
  expect(host.querySelector('label')?.textContent).toBe('Nachricht');
  expect(host.querySelector('textarea')?.placeholder).toBe('Type a message…');
  await act(() =>
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { cancelable: true })),
  );
  expect(submit).toHaveBeenCalledWith('Hello');
});
it('follows streamed content only at the live edge and disconnects resize observation', async () => {
  let resize!: () => void;
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  const view = (text: string) => (
    <AiChatContent>
      <AiMessage from="assistant">
        <AiMessageContent>{text}</AiMessageContent>
      </AiMessage>
    </AiChatContent>
  );
  await mount(view('First reply'));
  const viewport = host.querySelector<HTMLElement>('[role="log"]')!;
  let height = 700;
  Object.defineProperties(viewport, {
    scrollHeight: { get: () => height },
    clientHeight: { value: 200 },
    scrollTop: { value: 0, writable: true },
  });
  await act(() => resize());
  expect(viewport.scrollTop).toBe(700);
  await act(() => {
    viewport.scrollTop = 80;
    viewport.dispatchEvent(new Event('scroll'));
  });
  height = 900;
  await mount(view('More reply content'));
  await act(() => resize());
  expect(viewport.scrollTop).toBe(80);
  const jump = [...host.querySelectorAll('button')].find(
    (button) => button.getAttribute('aria-label') === 'Jump to latest',
  )!;
  expect(
    [...jump.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE),
  ).toHaveLength(0);
  expect(jump.querySelector('svg')).not.toBeNull();
  await act(() => jump.click());
  expect(viewport.scrollTop).toBe(900);
  await act(() => render(null, host));
  expect(disconnect).toHaveBeenCalledTimes(1);
});
it('does not automatically scroll when disabled', async () => {
  await mount(<AiChatContent autoScroll={false}>History</AiChatContent>);
  const viewport = host.querySelector<HTMLElement>('[role="log"]')!;
  Object.defineProperties(viewport, {
    scrollHeight: { value: 900 },
    clientHeight: { value: 200 },
    scrollTop: { value: 0, writable: true },
  });
  await mount(
    <AiChatContent autoScroll={false}>Updated history</AiChatContent>,
  );
  expect(viewport.scrollTop).toBe(0);
});

it('shows a status line without an empty disclosure before published text arrives', async () => {
  await mount(<AiReasoning isStreaming />);
  expect(host.textContent).toContain('Working…');
  expect(host.querySelector('details')).toBeNull();
  await mount(<AiReasoning isStreaming>Published text</AiReasoning>);
  expect(host.querySelector('details')!.open).toBe(true);
});
