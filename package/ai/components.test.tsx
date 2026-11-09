import { h, render, type ComponentChildren } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiAssistant, AiPromptInput, AiSuggestions } from './components';
import { mountAiAssistant } from './mount';
import { act } from 'preact/test-utils';
import { useState } from 'preact/hooks';

afterEach(() => {
  document.body.innerHTML = '';
});
describe('AI UI', () => {
  it('renders clarification labels and submits their full prompts, including More overflow', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const select = vi.fn();
    await act(() =>
      render(
        <AiSuggestions
          items={[
            { label: 'Europe', prompt: 'Show orders in Europe' },
            { label: 'Asia', prompt: 'Show orders in Asia' },
            { label: 'Americas', prompt: 'Show orders in Americas' },
            { label: 'All', prompt: 'Reset view' },
          ]}
          onSelect={select}
        />,
        host,
      ),
    );
    await act(() => host.querySelector<HTMLButtonElement>('button')!.click());
    expect(select).toHaveBeenCalledWith('Show orders in Europe');
    await act(() =>
      host.querySelector<HTMLElement>('[role="combobox"]')!.click(),
    );
    const option = [
      ...document.querySelectorAll<HTMLElement>('[role="option"]'),
    ].find((item) => item.textContent === 'All')!;
    expect(option.textContent).toBe('All');
    await act(() => option.click());
    expect(select).toHaveBeenLastCalledWith('Reset view');
    await act(() => render(null, host));
  });
  it('recalls prompts at multiline edges and restores the draft without intercepting composition or modifiers', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    function Prompt() {
      const [value, setValue] = useState('First line\nLast line');
      return (
        <AiPromptInput
          value={value}
          onValueChange={setValue}
          onSubmit={() => {}}
          promptHistory={['Old request', 'Latest request']}
        />
      );
    }
    await act(() => render(<Prompt />, host));
    const input = host.querySelector('textarea')!;
    const key = async (name: string, init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key: name,
        bubbles: true,
        cancelable: true,
        ...init,
      });
      await act(() => input.dispatchEvent(event));
      return event;
    };
    input.setSelectionRange(input.value.length, input.value.length);
    expect((await key('ArrowUp')).defaultPrevented).toBe(false);
    input.setSelectionRange(0, 0);
    expect((await key('ArrowDown')).defaultPrevented).toBe(false);
    expect((await key('ArrowUp', { ctrlKey: true })).defaultPrevented).toBe(
      false,
    );
    for (const modifier of [
      { altKey: true },
      { metaKey: true },
      { shiftKey: true },
    ])
      expect((await key('ArrowUp', modifier)).defaultPrevented).toBe(false);
    expect((await key('ArrowUp', { isComposing: true })).defaultPrevented).toBe(
      false,
    );
    expect((await key('ArrowUp')).defaultPrevented).toBe(true);
    expect(input.value).toBe('Latest request');
    await key('ArrowUp');
    expect(input.value).toBe('Old request');
    await key('ArrowDown');
    expect(input.value).toBe('Latest request');
    await key('ArrowDown');
    expect(input.value).toBe('First line\nLast line');
    await act(() => render(null, host));
  });
  it('does not recall prompts while busy or disabled', async () => {
    const host = document.createElement('div');
    const change = vi.fn();
    for (const props of [{ busy: true }, { disabled: true }]) {
      await act(() =>
        render(
          <AiPromptInput
            value=""
            onValueChange={change}
            onSubmit={() => {}}
            promptHistory={['Earlier']}
            {...props}
          />,
          host,
        ),
      );
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        cancelable: true,
      });
      await act(() => host.querySelector('textarea')!.dispatchEvent(event));
      expect(event.defaultPrevented).toBe(false);
    }
    expect(change).not.toHaveBeenCalled();
    await act(() => render(null, host));
  });
  it('loads host recall items and persists submitted prompts without making extra requests', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const onChange = vi.fn();
    const onSubmit = vi.fn();
    const mount = mountAiAssistant(host, {
      onSubmit,
      onStop() {},
      onRestore() {},
      onReset() {},
      promptHistory: { items: ['Saved prompt'], onChange },
    });
    await act(() => mount.update({ phase: 'idle', message: '' }));
    const input = host.querySelector('textarea')!;
    await act(() =>
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(input.value).toBe('Saved prompt');
    expect(onSubmit).not.toHaveBeenCalled();
    await act(() => {
      input.value = 'New prompt';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(() =>
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('New prompt');
    expect(onChange).toHaveBeenCalledExactlyOnceWith([
      'Saved prompt',
      'New prompt',
    ]);
    await act(() => mount.destroy());
  });
  it('keeps assistant keyboard events away from host shortcuts without preventing native input', () => {
    const host = document.createElement('div');
    const outer = vi.fn();
    const inner = vi.fn();
    host.addEventListener('keydown', outer);
    host.addEventListener('keyup', outer);
    render(
      <AiAssistant>
        <textarea onKeyDown={inner} />
      </AiAssistant>,
      host,
    );
    const input = host.querySelector('textarea')!;
    for (const type of ['keydown', 'keyup']) {
      const event = new KeyboardEvent(type, {
        key: 'a',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(inner).toHaveBeenCalledOnce();
    expect(outer).not.toHaveBeenCalled();
    render(null, host);
  });
  it('shows two badges and puts remaining suggestions in a translated dropdown', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const select = vi.fn();
    const items = ['One', 'Two', 'Three', 'Four', 'Five'];
    await act(() =>
      render(
        <AiSuggestions
          items={items}
          onSelect={select}
          translations={{ More: 'Plus' }}
        />,
        host,
      ),
    );
    expect(host.querySelectorAll('.rv-ai-suggestion')).toHaveLength(2);
    const trigger = host.querySelector<HTMLElement>('[role="combobox"]')!;
    expect(trigger.getAttribute('aria-label')).toBe('Plus');
    await act(() => trigger.click());
    const options = Array.from(
      document.querySelectorAll<HTMLElement>('[role="option"]'),
    );
    expect(options.map((option) => option.textContent?.trim())).toEqual([
      'Three',
      'Four',
      'Five',
    ]);
    await act(() => options[2].click());
    expect(select).toHaveBeenCalledExactlyOnceWith('Five');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toBe('');
    await act(() =>
      render(<AiSuggestions items={items} onSelect={select} disabled />, host),
    );
    await act(() =>
      host.querySelector<HTMLElement>('[role="combobox"]')!.click(),
    );
    expect(
      host.querySelector('[role="combobox"]')!.getAttribute('aria-expanded'),
    ).toBe('false');
    expect(host.querySelectorAll('button:disabled')).toHaveLength(2);
    await act(() => render(null, host));
  });
  it('omits the dropdown for two or fewer suggestions', async () => {
    const host = document.createElement('div');
    for (const items of [[], ['One'], ['One', 'Two']]) {
      await act(() =>
        render(<AiSuggestions items={items} onSelect={() => {}} />, host),
      );
      expect(host.querySelectorAll('.rv-ai-suggestion')).toHaveLength(
        items.length,
      );
      expect(host.querySelector('[role="combobox"]')).toBeNull();
    }
    await act(() => render(null, host));
  });
  it('moves completed drafts into the trail while retaining failed and unsubmitted drafts', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    const submit = vi.fn();
    const mount = mountAiAssistant(host, {
      onSubmit: submit,
      onStop() {},
      onRestore() {},
      onReset() {},
    });
    await act(() => mount.update({ phase: 'idle', message: '' }));
    const input = host.querySelector('textarea')!;
    expect(host.querySelector('.rv-ai-prompt-hint')).toBeNull();
    const type = async (value: string) => {
      await act(() => {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    };
    await type('Only Europe');
    expect(host.querySelector('.rv-ai-prompt-hint')).toBeNull();
    await act(() =>
      host
        .querySelector('form')!
        .dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true }),
        ),
    );
    expect(submit).toHaveBeenCalledWith('Only Europe');
    await act(() =>
      mount.update({
        phase: 'completed',
        message: 'Applied',
        steps: [{ id: '1', label: 'Only Europe' }],
      }),
    );
    expect(input.value).toBe('');
    expect(
      host.querySelector('.rv-ai-trail-trigger')!.getAttribute('aria-label'),
    ).toBe('Request history');
    expect(host.querySelector('.rv-ai-prompt-hint')).toBeNull();
    await type('Unsubmitted draft');
    await act(() =>
      mount.update({ phase: 'completed', message: 'Cleared', steps: [] }),
    );
    expect(input.value).toBe('Unsubmitted draft');
    await act(() =>
      host
        .querySelector('form')!
        .dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true }),
        ),
    );
    await act(() => mount.update({ phase: 'error', message: 'Offline' }));
    expect(input.value).toBe('Unsubmitted draft');
    mount.destroy();
  });
  it('hides keyboard guidance after typing and supports replacing it with toolbar context', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const view = (
      value = '',
      actions?: ComponentChildren,
      hint = 'Enter to apply',
    ) => (
      <AiPromptInput
        value={value}
        onValueChange={() => {}}
        onSubmit={() => {}}
        hint={hint}
        actions={actions}
      />
    );
    render(view(), host);
    const input = host.querySelector('textarea')!;
    expect(
      document.getElementById(input.getAttribute('aria-describedby')!)
        ?.textContent,
    ).toBe('Enter to apply');
    for (const value of ['Only Europe', ' ', '\n']) {
      render(view(value), host);
      expect(host.querySelector('.rv-ai-prompt-hint')).toBeNull();
      expect(input.hasAttribute('aria-describedby')).toBe(false);
    }
    render(view('', <button type="button">3 steps</button>, ''), host);
    expect(host.querySelector('.rv-ai-prompt-hint')).toBeNull();
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(host.querySelector('button')!.textContent).toBe('3 steps');
    render(view(), host);
    expect(host.querySelector('.rv-ai-prompt-hint')!.textContent).toBe(
      'Enter to apply',
    );
    render(null, host);
  });
  it('submits trimmed text with Enter but preserves Shift+Enter and IME input', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const submit = vi.fn();
    render(
      <AiPromptInput
        value="  expensive orders  "
        onValueChange={() => {}}
        onSubmit={submit}
      />,
      host,
    );
    const input = host.querySelector('textarea')!;
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'Enter',
        shiftKey: true,
      }),
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        key: 'Enter',
        isComposing: true,
      }),
    );
    expect(submit).not.toHaveBeenCalled();
    input.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
    );
    expect(submit).toHaveBeenCalledWith('expensive orders');
    render(null, host);
  });
  it('disables blank submissions and exposes a stop action while busy', () => {
    const host = document.createElement('div');
    render(
      <AiPromptInput value=" " onValueChange={() => {}} onSubmit={vi.fn()} />,
      host,
    );
    expect(host.querySelector('button')!.disabled).toBe(true);
    const stop = vi.fn();
    render(
      <AiPromptInput
        value="filter"
        onValueChange={() => {}}
        onSubmit={vi.fn()}
        busy
        onStop={stop}
      />,
      host,
    );
    expect(host.querySelector('textarea')!.disabled).toBe(true);
    host.querySelector('button')!.click();
    expect(stop).toHaveBeenCalledTimes(1);
    render(null, host);
  });
  it('keeps icon actions named and accepts host tools', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const submit = vi.fn();
    render(
      <AiPromptInput
        value="  Only Europe  "
        onValueChange={() => {}}
        onSubmit={submit}
        label="Change the current view"
        submitLabel="Apply request"
        hint="Enter to apply"
        actions={<button type="button">Current view</button>}
      />,
      host,
    );
    const input = host.querySelector('textarea')!;
    expect(host.querySelector('label')!.htmlFor).toBe(input.id);
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(host.querySelector('.rv-ai-prompt-hint')).toBeNull();
    const action = host.querySelector<HTMLButtonElement>(
      '[aria-label="Apply request"]',
    )!;
    expect(action.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
    host.querySelector<HTMLButtonElement>('button[type="button"]')!.click();
    expect(submit).not.toHaveBeenCalled();
    host
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(submit).toHaveBeenCalledExactlyOnceWith('Only Europe');
    render(
      <AiPromptInput
        value=""
        onValueChange={() => {}}
        onSubmit={submit}
        hint=""
      />,
      host,
    );
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    render(null, host);
  });
  it('blocks submission when busy without cancellation or when disabled', () => {
    const host = document.createElement('div');
    const submit = vi.fn();
    for (const state of [{ busy: true }, { disabled: true }]) {
      render(
        <AiPromptInput
          value="Only Europe"
          onValueChange={() => {}}
          onSubmit={submit}
          {...state}
        />,
        host,
      );
      expect(host.querySelector('button')!.disabled).toBe(true);
      host
        .querySelector('form')!
        .dispatchEvent(
          new Event('submit', { bubbles: true, cancelable: true }),
        );
      host
        .querySelector('textarea')!
        .dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
        );
    }
    expect(submit).not.toHaveBeenCalled();
    render(null, host);
  });
  it('forwards native textarea sizing through the mounted assistant', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const mount = mountAiAssistant(host, {
      onSubmit() {},
      onStop() {},
      onRestore() {},
      onReset() {},
      prompt: {
        textareaProps: {
          className: 'custom-prompt',
          rows: 3,
          style: { minHeight: '5rem', maxHeight: '10rem' },
        },
      },
    });
    mount.update({ phase: 'idle', message: '' });
    const input = host.querySelector('textarea')!;
    expect(input.classList.contains('custom-prompt')).toBe(true);
    expect(input.getAttribute('rows')).toBe('3');
    expect(input.style.minHeight).toBe('5rem');
    expect(input.style.maxHeight).toBe('10rem');
    expect(input.labels?.[0].textContent).toBe('Ask AI to change this view');
    mount.destroy();
  });
  it('selects suggestions without submitting and releases the mounted UI', () => {
    const host = document.createElement('div');
    document.body.append(host);
    const select = vi.fn();
    render(<AiSuggestions items={['Show Europe']} onSelect={select} />, host);
    host.querySelector('button')!.click();
    expect(select).toHaveBeenCalledWith('Show Europe');
    render(null, host);
    const submit = vi.fn();
    const mount = mountAiAssistant(host, {
      onSubmit: submit,
      onStop() {},
      onRestore() {},
      onReset() {},
    });
    mount.update({
      phase: 'completed',
      message: 'Applied',
      matchedRows: 0,
      canRestore: true,
    });
    expect(host.textContent).toContain('0 matching rows');
    expect(host.querySelector('[role="status"]')).not.toBeNull();
    mount.destroy();
    expect(host.childNodes.length).toBe(0);
    mount.update({ phase: 'error', message: 'late' });
    expect(host.childNodes.length).toBe(0);
  });
  it('runs a mounted suggestion once and blocks suggestions while a request is busy', () => {
    const host = document.createElement('div');
    const submit = vi.fn();
    const mount = mountAiAssistant(host, {
      onSubmit: submit,
      onStop() {},
      onRestore() {},
      onReset() {},
      suggestions: ['Only Europe'],
    });
    mount.update({ phase: 'idle', message: '' });
    const suggestion = host.querySelector<HTMLButtonElement>(
      '.rv-ai-suggestions button',
    )!;
    suggestion.click();
    expect(submit).toHaveBeenCalledExactlyOnceWith('Only Europe');
    mount.update({ phase: 'understanding', message: 'Working…' });
    expect(suggestion.disabled).toBe(true);
    suggestion.click();
    expect(submit).toHaveBeenCalledTimes(1);
    mount.destroy();
  });
});

it('renders action details as bounded plain text inside the shared result', () => {
  const host = document.createElement('div');
  const mount = mountAiAssistant(host, {
    onSubmit() {},
    onStop() {},
    onRestore() {},
    onReset() {},
  });
  mount.update({
    phase: 'completed',
    message: 'Read 1 record.',
    resultDetails: '<img src=x onerror=alert(1)>',
  });
  expect(host.querySelector('.rv-status-feedback__detail')?.textContent).toBe(
    '<img src=x onerror=alert(1)>',
  );
  expect(host.querySelector('img')).toBeNull();
  mount.update({ phase: 'understanding', message: 'Working' });
  expect(host.querySelectorAll('.rv-status-feedback__item')).toHaveLength(2);
  expect(
    host.querySelector('.rv-status-feedback__detail')?.textContent,
  ).toContain('<img');
  mount.update({ phase: 'applying', message: 'Applying' });
  mount.update({ phase: 'completed', message: 'Filtered rows.' });
  mount.update({ phase: 'completed', message: 'Filtered rows.' });
  expect(host.querySelectorAll('.rv-status-feedback__item')).toHaveLength(2);
  expect(
    host.querySelectorAll('.rv-status-feedback__title')[1].textContent,
  ).toBe('Filtered rows.');
  expect(host.querySelectorAll('[aria-busy=true]')).toHaveLength(0);
  mount.destroy();
});

it('keeps the draft during approval, focuses Apply, and restores focus after Escape cancellation', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const submit = vi.fn(),
    apply = vi.fn(),
    cancel = vi.fn();
  const mount = mountAiAssistant(host, {
    onSubmit: submit,
    onStop() {},
    onRestore() {},
    onReset() {},
    onApplyAction: apply,
    onCancelAction() {
      cancel();
      mount.update({ phase: 'cancelled', message: 'Cancelled' });
    },
  });
  await act(() => mount.update({ phase: 'idle', message: '' }));
  const input = host.querySelector('textarea')!;
  await act(() => {
    input.value = 'Update record';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Send"]')!.click(),
  );
  expect(submit).toHaveBeenCalledWith('Update record');
  await act(() =>
    mount.update({
      phase: 'preview',
      message: 'Review',
      pendingAction: { summary: 'One row', details: '<script>bad()</script>' },
    }),
  );
  expect(input.disabled).toBe(true);
  expect(input.value).toBe('Update record');
  const approval = host.querySelector('section[aria-label="Review changes"]')!;
  expect(approval.querySelector('script')).toBeNull();
  expect(approval.textContent).toContain('<script>bad()</script>');
  expect(document.activeElement?.textContent).toBe('Apply changes');
  await act(() =>
    document.activeElement!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    ),
  );
  expect(cancel).toHaveBeenCalledOnce();
  expect(apply).not.toHaveBeenCalled();
  expect(input.disabled).toBe(false);
  expect(input.value).toBe('Update record');
  expect(document.activeElement).toBe(input);
  mount.destroy();
});

it('shows readable current and proposed values instead of developer details', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const mount = mountAiAssistant(host, {
    onSubmit() {},
    onStop() {},
    onRestore() {},
    onReset() {},
    translations: { Current: 'Before', Proposed: 'After' },
  });
  await act(() =>
    mount.update({
      phase: 'preview',
      message: '',
      pendingAction: {
        summary: 'Update task',
        details: '{"privateDeveloperDetails":true}',
        notice: 'Dependent dates may change.',
        changes: [
          {
            item: '<img src=x>',
            label: 'Progress',
            before: '0%',
            after: '50%',
          },
        ],
      },
    }),
  );
  const review = host.querySelector('section[aria-label="Review changes"]')!;
  expect(
    [...review.querySelectorAll('thead th')].map((cell) => cell.textContent),
  ).toEqual(['Change', 'Before', 'After']);
  expect(review.querySelector('tbody')?.textContent).toContain(
    '<img src=x>Progress0%50%',
  );
  expect(review.textContent).toContain('Dependent dates may change.');
  expect(review.textContent).not.toContain('privateDeveloperDetails');
  expect(review.querySelector('pre, img')).toBeNull();
  mount.destroy();
});

it('localizes preview controls and disables history actions until approval finishes', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const apply = vi.fn(),
    undo = vi.fn();
  const mount = mountAiAssistant(host, {
    onSubmit() {},
    onStop() {},
    onRestore() {},
    onReset() {},
    onApplyAction: apply,
    onCancelAction() {},
    onUndoData: undo,
    onRedoData() {},
    translations: {
      'Review changes': 'Réviser',
      'Apply changes': 'Appliquer',
      'Cancel changes': 'Annuler',
      'Undo data change': 'Annuler modification',
    },
  });
  await act(() =>
    mount.update({
      phase: 'preview',
      message: '',
      pendingAction: { summary: 'Vérifier' },
      canUndoData: true,
    }),
  );
  expect(host.querySelector('section[aria-label="Réviser"]')).not.toBeNull();
  const buttons = () => [...host.querySelectorAll<HTMLButtonElement>('button')];
  const undoButton = buttons().find(
    (button) => button.getAttribute('aria-label') === 'Annuler modification',
  )!;
  expect(undoButton.disabled).toBe(true);
  expect(undoButton.querySelector('svg')).not.toBeNull();
  buttons()
    .find((button) => button.textContent === 'Appliquer')!
    .click();
  expect(apply).toHaveBeenCalledOnce();
  await act(() =>
    mount.update({
      phase: 'completed',
      message: 'Appliqué',
      canUndoData: true,
    }),
  );
  expect(undoButton.disabled).toBe(false);
  undoButton.click();
  expect(undo).toHaveBeenCalledOnce();
  mount.destroy();
});

it('updates suggestions without replacing the draft, preview or history controls', async () => {
  const host = document.createElement('div');
  const mount = mountAiAssistant(host, {
    onSubmit() {},
    onStop() {},
    onRestore() {},
    onReset() {},
    suggestions: ['Original'],
    onUndoData() {},
    onRedoData() {},
  });
  await act(() =>
    mount.update({ phase: 'idle', message: '', canUndoData: true }),
  );
  const input = host.querySelector('textarea')!;
  await act(() => {
    input.value = 'Keep draft';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(() => mount.setSuggestions(['Updated']));
  expect(host.querySelector('textarea')).toBe(input);
  expect(input.value).toBe('Keep draft');
  expect(host.querySelector('.rv-ai-suggestion')?.textContent).toBe('Updated');
  expect(host.querySelectorAll('.rv-history-controls svg')).toHaveLength(2);
  const undo = host.querySelector<HTMLButtonElement>(
    '[aria-label="Undo data change"]',
  )!;
  expect(undo.disabled).toBe(false);
  await act(() =>
    mount.update({
      phase: 'preview',
      message: '',
      pendingAction: { summary: 'Keep preview' },
      canUndoData: true,
    }),
  );
  await act(() => mount.setSuggestions(['Another stage']));
  expect(
    host.querySelector('section[aria-label="Review changes"]')?.textContent,
  ).toContain('Keep preview');
  expect(input.value).toBe('Keep draft');
  expect(undo.disabled).toBe(true);
  mount.destroy();
});

it.each(['toolbar', 'chat'] as const)(
  'mounts one chat-style composer with embedded suggestions in %s mode',
  async (mode) => {
    const host = document.createElement('div');
    document.body.append(host);
    const onSubmit = vi.fn();
    const mount = mountAiAssistant(host, {
      mode,
      onSubmit,
      onStop() {},
      onRestore() {},
      onReset() {},
      suggestions: ['First', 'Second', 'Third', 'Fourth'],
    });
    try {
      await act(() => mount.update({ phase: 'idle', message: '' }));
      const composer = host.querySelector('.rv-ai-prompt-composer')!;
      const suggestions = host.querySelector('.rv-ai-suggestions')!;
      expect(host.querySelectorAll('.rv-ai-chat-composer')).toHaveLength(1);
      expect(host.querySelectorAll('.rv-ai-suggestions')).toHaveLength(1);
      expect(
        composer.querySelector('.rv-ai-prompt-footer .rv-ai-suggestions'),
      ).toBe(suggestions);
      expect(host.querySelector('textarea')?.placeholder).toBe(
        'Type a message…',
      );
      expect(suggestions.querySelectorAll('button')).toHaveLength(2);
      await act(() =>
        suggestions.querySelector<HTMLElement>('[role="combobox"]')!.click(),
      );
      const fourth = [
        ...document.querySelectorAll<HTMLElement>('[role="option"]'),
      ].find((item) => item.textContent === 'Fourth')!;
      await act(() => fourth.click());
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Fourth');
      await act(() =>
        mount.update({
          phase: 'preview',
          message: 'Review',
          pendingAction: { summary: 'Change' },
        }),
      );
      expect(
        [...suggestions.querySelectorAll<HTMLButtonElement>('button')].every(
          (button) => button.disabled,
        ),
      ).toBe(true);
      await act(() =>
        suggestions.querySelector<HTMLButtonElement>('button')!.click(),
      );
      expect(onSubmit).toHaveBeenCalledTimes(1);
    } finally {
      await act(() => mount.destroy());
    }
  },
);

it('uses the configured inline suggestion count and retains overflow choices', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  for (const maxVisible of [0, 1, 4]) {
    await act(() =>
      render(
        <AiSuggestions
          items={['One', 'Two', 'Three']}
          maxVisible={maxVisible}
          onSelect={() => {}}
        />,
        host,
      ),
    );
    expect(host.querySelectorAll('.rv-ai-suggestion')).toHaveLength(
      Math.min(maxVisible, 3),
    );
    expect(host.querySelector('[role="combobox"]') !== null).toBe(
      maxVisible < 3,
    );
  }
  await act(() => render(null, host));
});

it('searches overflow requests with translated accessible text and submits the full prompt', async () => {
  const host = document.createElement('div');
  document.body.append(host);
  const select = vi.fn();
  await act(() =>
    render(
      <AiSuggestions
        items={[
          'First',
          'Second',
          { label: 'Currency', prompt: 'Format Amount as currency' },
          'Charts',
        ]}
        translations={{ 'Search requests': 'Rechercher des demandes' }}
        onSelect={select}
      />,
      host,
    ),
  );
  await act(() =>
    host.querySelector<HTMLElement>('[role="combobox"]')!.click(),
  );
  const search = document.querySelector<HTMLInputElement>(
    'input[aria-label="Rechercher des demandes"]',
  );
  expect(search).toBeTruthy();
  await act(() => {
    search!.value = 'currency';
    search!.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const options = [
    ...document.querySelectorAll<HTMLElement>('[role="option"]'),
  ];
  expect(options.map((option) => option.textContent)).toEqual(['Currency']);
  await act(() => options[0].click());
  expect(select).toHaveBeenCalledWith('Format Amount as currency');
  await act(() => render(null, host));
});
