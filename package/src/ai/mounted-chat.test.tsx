import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import {
  mountAiAssistant,
  type AiAssistantMountOptions,
  type AiAssistantMountState,
} from './mount';

const mounts: Array<ReturnType<typeof mountAiAssistant>> = [];
afterEach(async () => {
  await act(() => mounts.splice(0).forEach((mount) => mount.destroy()));
  document.body.replaceChildren();
});
async function setup(extra: Partial<AiAssistantMountOptions> = {}) {
  const host = document.createElement('div');
  document.body.append(host);
  const options: AiAssistantMountOptions = {
    mode: 'chat',
    onSubmit: vi.fn(),
    onStop: vi.fn(),
    onApplyAction: vi.fn(),
    onCancelAction: vi.fn(),
    onClearChat: vi.fn(),
    ...extra,
  };
  const ui = mountAiAssistant(host, options);
  mounts.push(ui);
  const update = (state: AiAssistantMountState) => act(() => ui.update(state));
  await update({ phase: 'idle', message: '' });
  const button = (label: string) =>
    [...host.querySelectorAll<HTMLButtonElement>('button')].find(
      (button) =>
        button.getAttribute('aria-label') === label ||
        button.textContent === label,
    )!;
  return { host, ui, options, update, button };
}
const request = { id: '1', prompt: 'Rename an order' };
const row = (
  phase: AiAssistantMountState['phase'],
  message: string,
): AiAssistantMountState => ({ phase, message, request });

it('records accepted programmatic requests, not drafts or speculative submit clicks', async () => {
  const h = await setup();
  const input = h.host.querySelector('textarea')!;
  await act(() => {
    input.value = 'Unaccepted draft';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(() => {
    input.form!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
  });
  expect(h.options.onSubmit).toHaveBeenCalledWith('Unaccepted draft');
  expect(h.host.querySelectorAll('.rv-ai-message')).toHaveLength(0);
  await h.update(row('understanding', 'Working'));
  expect(h.host.querySelector('.rv-ai-message--user')!.textContent).toBe(
    request.prompt,
  );
  expect(h.host.textContent).not.toContain('Unaccepted draft');
  await h.update(row('completed', 'Renamed'));
  await h.update({ ...row('completed', 'Renamed'), canUndoData: true });
  expect(h.host.querySelectorAll('.rv-ai-message')).toHaveLength(2);
  expect(
    h.host.querySelector('.rv-ai-message--assistant')!.textContent,
  ).toContain('Renamed');
  expect(h.host.querySelector('label')!.textContent).toBe(
    'Ask AI to change this view',
  );
});

it('reuses native approval controls inside the active assistant bubble and preserves the transcript', async () => {
  const h = await setup({ activityDurationMs: 1 });
  await h.update(row('understanding', 'Working'));
  await h.update({
    ...row('preview', 'Review these changes before applying.'),
    pendingAction: { summary: 'Change title', details: '{"title":"New"}' },
  });
  const reply = h.host.querySelector('.rv-ai-message--assistant')!;
  expect(reply.textContent).not.toContain(
    'Review these changes before applying.',
  );
  expect(reply.textContent?.match(/Change title/g)).toHaveLength(1);
  expect(reply.querySelectorAll('.rv-ai-change-preview')).toHaveLength(1);
  expect(h.host.querySelectorAll('[aria-label="Review changes"]')).toHaveLength(
    1,
  );
  expect(h.button('New conversation').disabled).toBe(true);
  await act(() => h.button('Apply changes').click());
  expect(h.options.onApplyAction).toHaveBeenCalledTimes(1);
  await act(() => h.button('Cancel changes').click());
  expect(h.options.onCancelAction).toHaveBeenCalledTimes(1);
  await h.update(row('applying', 'Applying'));
  await h.update({
    ...row('completed', 'Changed'),
    resultDetails: '{"changed":1}',
  });
  await h.update({
    ...row('understanding', 'Summarizing'),
    resultDetails: '{"changed":1}',
  });
  await h.update({
    ...row('completed', 'Final explanation'),
    resultDetails: '{"changed":1}',
  });
  expect(h.host.querySelectorAll('.rv-ai-message--assistant')).toHaveLength(1);
  expect(h.host.querySelectorAll('[aria-label="Review changes"]')).toHaveLength(
    0,
  );
  expect(h.host.querySelector('pre')!.textContent).toBe('{"changed":1}');
  expect(h.host.querySelector('.rv-ai-activity')).toBeNull();
});

it('records independent history operations as system messages and clears only via host epoch', async () => {
  const h = await setup();
  await h.update(row('completed', 'Applied'));
  await h.update(row('applying', 'Undoing'));
  expect(h.button('New conversation').disabled).toBe(true);
  await h.update(row('completed', 'Undone'));
  expect(h.host.querySelectorAll('.rv-ai-message--assistant')).toHaveLength(1);
  expect(h.host.querySelector('.rv-ai-message--system')!.textContent).toContain(
    'Undone',
  );
  await act(() => h.button('New conversation').click());
  expect(h.options.onClearChat).toHaveBeenCalledTimes(1);
  expect(h.host.querySelectorAll('.rv-ai-message')).toHaveLength(3);
  const input = h.host.querySelector('textarea')!;
  await act(() => {
    input.value = 'Draft';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await h.update({
    phase: 'idle',
    message: '',
    chatKey: 1,
    steps: [{ id: 'step', label: 'Existing filter' }],
  });
  expect(h.host.querySelectorAll('.rv-ai-message')).toHaveLength(0);
  expect(h.host.querySelector('textarea')!.value).toBe('');
  expect(h.host.querySelector('.rv-ai-request-trail')).toBeNull();
});

it('renders only supplied public text as text, and retains earlier terminal states', async () => {
  const h = await setup({ translations: { 'New conversation': 'Effacer' } });
  await h.update({
    ...row('completed', '<img src=x onerror=alert(1)>'),
    resultDetails: '<script>privateCode()</script>',
    internalPrompt: 'never show',
  } as AiAssistantMountState);
  await h.update({
    ...row('clarification', 'Which record?'),
    request: { id: '2', prompt: 'Question' },
  });
  expect(h.host.querySelector('img')).toBeNull();
  expect(h.host.querySelector('script')).toBeNull();
  expect(h.host.querySelector('pre')!.textContent).toBe(
    '<script>privateCode()</script>',
  );
  expect(h.host.textContent).not.toContain('never show');
  expect(h.host.querySelectorAll('.rv-ai-message--user')).toHaveLength(2);
  expect(h.host.querySelectorAll('.rv-ai-message--assistant')).toHaveLength(2);
  expect(h.button('Effacer')).toBeTruthy();
});

it('keeps toolbar mode as the default without a transcript or chat controls', async () => {
  const h = await setup({ mode: undefined });
  await h.update({
    ...row('completed', 'Toolbar result'),
    resultDetails: 'Plain detail',
  });
  expect(h.host.querySelector('[role="log"]')).toBeNull();
  expect(h.host.querySelector('.rv-ai-activity')).not.toBeNull();
  expect(h.host.querySelector('.rv-ai-message')).toBeNull();
  expect(h.button('New conversation')).toBeDefined();
});

it('mounts reactive history controls in a separate host and can omit clear chat', async () => {
  const controls = document.createElement('div');
  document.body.append(controls);
  const undo = vi.fn();
  const h = await setup({
    controlsMountTo: controls,
    showClearChat: false,
    onUndoData: undo,
  });
  expect(h.host.querySelector('.rv-ai-result-actions')).toBeNull();
  expect(document.body.textContent).not.toContain('New conversation');
  const button = controls.querySelector<HTMLButtonElement>(
    '[aria-label="Undo data change"]',
  )!;
  expect(button.disabled).toBe(true);
  await h.update({ phase: 'completed', message: 'Updated', canUndoData: true });
  expect(button.disabled).toBe(false);
  await act(() => button.click());
  expect(undo).toHaveBeenCalledOnce();
  expect(controls.textContent).not.toMatch(/Reset view|Restore previous view/);
});

it('prefers structured results to JSON and preserves them with the final answer', async () => {
  const h = await setup();
  const result = {
    kind: 'table',
    title: 'Visible summary',
    columns: [{ label: 'Region' }, { label: 'Amount' }],
    rows: [['Europe', 42260]],
  } as const;
  await h.update({
    ...row('completed', 'Aggregated'),
    result,
    resultDetails: '{"privateRawKey":true}',
  });
  await h.update({ ...row('understanding', 'Summarizing'), result });
  await h.update({ ...row('completed', 'Final answer'), result });
  expect(h.host.querySelectorAll('table')).toHaveLength(1);
  expect(h.host.querySelector('caption')?.textContent).toBe('Visible summary');
  expect(h.host.textContent).toContain('Final answer');
  expect(h.host.textContent).not.toContain('privateRawKey');
  expect(h.host.querySelector('pre')).toBeNull();
});

it('mounts custom empty-chat content only while the transcript is empty and cleans it up', async () => {
  const dispose = vi.fn();
  const renderContent = vi.fn((host: HTMLElement) => {
    const image = document.createElement('img');
    image.alt = 'Welcome illustration';
    image.src = '/welcome.svg';
    host.append(image);
    return dispose;
  });
  const h = await setup({
    emptyState: {
      title: 'What would you like to do?',
      description: 'Ask about orders.',
      renderContent,
    },
  });
  expect(h.host.textContent).toContain('What would you like to do?');
  expect(h.host.querySelector('img')?.alt).toBe('Welcome illustration');
  await h.update({ phase: 'idle', message: '', canUndoData: true });
  expect(renderContent).toHaveBeenCalledTimes(1);
  await h.update(row('understanding', 'Working'));
  expect(h.host.querySelector('.rv-ai-chat-empty')).toBeNull();
  expect(dispose).toHaveBeenCalledTimes(1);
  await h.update({ phase: 'idle', message: '', chatKey: 1 });
  expect(renderContent).toHaveBeenCalledTimes(2);
  await act(() => h.ui.destroy());
  expect(dispose).toHaveBeenCalledTimes(2);
});

it.each([undefined, false] as const)(
  'keeps the mounted empty state opt-in (%s)',
  async (emptyState) => {
    const h = await setup({ emptyState });
    expect(h.host.querySelector('.rv-ai-chat-empty')).toBeNull();
  },
);

it('can omit history controls while preserving the chat composer and submit behavior', async () => {
  const h = await setup({ showHistoryControls: false });
  expect(h.host.querySelector('.rv-ai-result-actions')).toBeNull();
  const input = h.host.querySelector('textarea')!;
  await act(() => {
    input.value = 'Configure my view';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(() => {
    input.form!.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
  });
  expect(h.options.onSubmit).toHaveBeenCalledWith('Configure my view');
});

it('forwards a trusted table renderer to retained chat results', async () => {
  const renderer = vi.fn((result) => `Custom table: ${result.title}`);
  const view = await setup({ renderTable: renderer });
  await view.update({
    ...row('completed', 'Read'),
    result: {
      kind: 'table',
      title: 'Records',
      columns: [{ label: 'Name' }],
      rows: [['Ada']],
    },
  });
  expect(renderer).toHaveBeenCalled();
  expect(view.host.textContent).toContain('Custom table: Records');
  expect(view.host.querySelector('table')).toBeNull();
});

it('keeps restart in the chat when view history is hidden or mounted elsewhere', async () => {
  const controls = document.createElement('div');
  document.body.append(controls);
  const h = await setup({
    controlsMountTo: controls,
    showHistoryControls: false,
  });
  await h.update(row('completed', 'Answered'));
  expect(h.button('New conversation').disabled).toBe(false);
  expect(controls.textContent).toBe('');
  await act(() => h.button('New conversation').click());
  expect(h.options.onClearChat).toHaveBeenCalledOnce();
});

it('keeps New conversation outside explicitly enabled request history', async () => {
  const h = await setup({ showRequestHistory: true });
  await h.update({
    ...row('completed', 'Answered'),
    steps: [{ id: '1', label: 'Only Europe' }],
  });
  const popup = h.host.querySelector<HTMLElement>('[role="dialog"]')!;
  expect(popup.contains(h.button('New conversation'))).toBe(false);
  await act(() => h.button('Request history').click());
  expect(popup.hidden).toBe(false);
  await act(() => h.button('New conversation').click());
  expect(h.options.onClearChat).toHaveBeenCalledOnce();
  expect(document.activeElement).toBe(h.host.querySelector('textarea'));
  expect(popup.hidden).toBe(true);
});

it('offers Clear chart separately even when chat request history is hidden', async () => {
  const onClearChart = vi.fn();
  const h = await setup({ onClearChart });
  const state = {
    ...row('completed', 'Chart ready'),
    steps: [{ id: '1', label: 'Only Europe' }],
  };
  await h.update({ ...state, canClearChart: true });
  expect(h.host.querySelector('[role="dialog"]')).toBeNull();
  await act(() => h.button('Clear chart').click());
  expect(onClearChart).toHaveBeenCalledOnce();
  expect(h.options.onClearChat).not.toHaveBeenCalled();
  await h.update({ ...state, canClearChart: false });
  expect(h.button('Clear chart')).toBeUndefined();
});

it('offers Clear chart without filter steps and disables it during transitions', async () => {
  const onClearChart = vi.fn();
  const h = await setup({ onClearChart });
  await h.update({
    ...row('completed', 'Chart ready'),
    canClearChart: true,
    viewSwitching: true,
  });
  expect(h.button('Clear chart').disabled).toBe(true);
  await h.update({ ...row('completed', 'Chart ready'), canClearChart: true });
  await act(() => h.button('Clear chart').click());
  expect(onClearChart).toHaveBeenCalledOnce();
});

it('does not mistake informational action history for manually changed command state', async () => {
  const h = await setup({ showRequestHistory: true });
  await h.update({
    ...row('completed', 'Showing dashboard.'),
    canEditSteps: false,
    steps: [{ id: '1', label: 'Show dashboard', removable: false }],
  });
  await act(() => h.button('Request history').click());
  expect(h.host.textContent).not.toContain('The view changed manually.');
  expect(h.host.querySelector('.rv-ai-step .rv-remove-button')).toBeNull();
});

it('passes the configured inline choice limit to the shared suggestions', async () => {
  const h = await setup({
    suggestions: ['One', 'Two', 'Three'],
    maxVisibleSuggestions: 1,
  });
  expect(h.host.querySelectorAll('.rv-ai-suggestion')).toHaveLength(1);
  expect(h.host.querySelector('[role="combobox"]')).not.toBeNull();
});

it('separates new conversation from optional request history and never renders workspace reset', async () => {
  const h = await setup();
  await h.update({
    ...row('completed', 'Applied'),
    steps: [{ id: '1', label: 'Only Europe' }],
  });
  expect(h.host.querySelector('.rv-ai-request-trail')).toBeNull();
  expect(
    h.host.querySelector('[aria-label="New conversation"]'),
  ).not.toBeNull();
  expect(h.host.textContent).not.toMatch(
    /Clear all|Reset view|Restore previous view/,
  );
  const input = h.host.querySelector('textarea')!;
  await act(() => {
    input.value = 'Unsent draft';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await h.update({ phase: 'idle', message: '', chatKey: 1, steps: [] });
  expect(input.value).toBe('');
  expect(h.host.querySelectorAll('.rv-ai-message')).toHaveLength(0);
});

it('offers New conversation only when there are messages, context or a draft to clear', async () => {
  const h = await setup();
  expect(h.host.querySelector('[aria-label="New conversation"]')).toBeNull();
  const input = h.host.querySelector('textarea')!;
  await act(() => {
    input.value = 'Draft';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(h.button('New conversation')).toBeDefined();
  await h.update({ phase: 'idle', message: '', chatKey: 1 });
  expect(input.value).toBe('');
  expect(h.host.querySelector('[aria-label="New conversation"]')).toBeNull();
  await h.update(row('completed', 'An answer'));
  expect(h.button('New conversation')).toBeDefined();
});

it('uses a history icon in toolbar mode and lets the host hide it', async () => {
  const h = await setup({ mode: 'toolbar' });
  await h.update({
    ...row('completed', 'Updated'),
    steps: [{ id: '1', label: 'Only Europe' }],
  });
  const trigger = h.host.querySelector<HTMLButtonElement>(
    '.rv-ai-trail-trigger',
  )!;
  expect(trigger.getAttribute('aria-label')).toBe('Request history');
  expect(trigger.textContent).toBe('');
  expect(h.host.textContent).not.toMatch(
    /Clear all|Reset view|Restore previous view/,
  );
  const hidden = await setup({ mode: 'toolbar', showRequestHistory: false });
  await hidden.update({
    ...row('completed', 'Updated'),
    steps: [{ id: '1', label: 'Only Europe' }],
  });
  expect(hidden.host.querySelector('.rv-ai-trail-trigger')).toBeNull();
});
