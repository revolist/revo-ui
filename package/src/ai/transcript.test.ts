import { expect, it } from 'vitest';
import { AiTranscript } from './transcript';
import type { AiAssistantMountState } from './mount';

const state = (
  phase: AiAssistantMountState['phase'],
  message = phase,
): AiAssistantMountState => ({
  phase,
  message,
  request: { id: '1', prompt: 'Public request' },
});
it('records accepted requests once and updates one assistant through approval and answer continuation', () => {
  const transcript = new AiTranscript();
  transcript.update(state('understanding'));
  transcript.update({
    ...state('preview'),
    pendingAction: { summary: 'Review' },
  });
  transcript.update(state('applying'));
  transcript.update(state('completed', 'Applied'));
  transcript.update(state('understanding', 'Summarizing'));
  transcript.update(state('completed', 'Answer'));
  transcript.update({ ...state('completed', 'Answer'), canUndoData: true });
  expect(
    transcript.messages.map((message) => [message.from, message.text]),
  ).toEqual([
    ['user', 'Public request'],
    ['assistant', 'Answer'],
  ]);
});
it('keeps independent undo/restore/error statuses separate from prior user turns', () => {
  const transcript = new AiTranscript();
  transcript.update(state('completed', 'Applied'));
  transcript.update(state('applying', 'Restoring'));
  transcript.update(state('completed', 'Restored'));
  transcript.update(state('error', 'Independent error'));
  expect(transcript.messages.map((message) => message.from)).toEqual([
    'user',
    'assistant',
    'system',
    'system',
  ]);
  expect(transcript.messages[1].text).toBe('Applied');
  expect(transcript.messages[2].text).toBe('Restored');
});
it('clears with an epoch and ignores a repeated old request after the reset', () => {
  const transcript = new AiTranscript();
  transcript.update(state('completed'));
  transcript.update({ ...state('completed'), chatKey: 1 });
  transcript.update({ ...state('completed'), chatKey: 1 });
  expect(transcript.messages).toEqual([]);
  transcript.update({
    ...state('understanding'),
    chatKey: 1,
    request: { id: '2', prompt: 'Next' },
  });
  expect(transcript.messages[0].text).toBe('Next');
});
it('prunes whole older turns at 50 messages and 64 KiB while retaining only public state', () => {
  const transcript = new AiTranscript();
  for (let index = 0; index < 40; index++)
    transcript.update({
      ...state('completed', 'Reply' + index),
      request: { id: String(index), prompt: 'Request' + index },
    });
  expect(transcript.messages).toHaveLength(50);
  expect(transcript.messages[0].from).toBe('user');
  for (let index = 40; index < 70; index++)
    transcript.update({
      ...state('completed', '🙂'.repeat(20000)),
      request: { id: String(index), prompt: '🙂'.repeat(20000) },
      resultDetails: 'x'.repeat(200000),
      secretPrompt: 'never retain',
    } as AiAssistantMountState);
  expect(
    new TextEncoder().encode(JSON.stringify(transcript.messages)).byteLength,
  ).toBeLessThanOrEqual(65536);
  expect(transcript.messages[0].from).toBe('user');
  expect(JSON.stringify(transcript.messages)).not.toContain('never retain');
});

it('keeps the current approval turn visible with JSON-escaped oversized text', () => {
  const transcript = new AiTranscript();
  transcript.update({
    phase: 'preview',
    message: '\0'.repeat(100000),
    resultDetails: '"'.repeat(100000),
    request: { id: 'pending', prompt: '"'.repeat(100000) },
    pendingAction: {
      summary: 'Review the actual change',
      details: 'Original preview',
    },
  });
  expect(transcript.messages.map((message) => message.from)).toEqual([
    'user',
    'assistant',
  ]);
  expect(transcript.messages[1].pending).toBe(true);
  expect(
    new TextEncoder().encode(JSON.stringify(transcript.messages)).byteLength,
  ).toBeLessThanOrEqual(65536);
});

it('does not copy an earlier result into a later unrelated error or cancellation', () => {
  const transcript = new AiTranscript();
  transcript.update({
    ...state('completed', 'Read result'),
    resultDetails: 'Disclosed rows',
  });
  transcript.update({
    ...state('error', 'Request too long'),
    resultDetails: 'Disclosed rows',
  });
  expect(transcript.messages.at(-1)).toMatchObject({
    from: 'system',
    text: 'Request too long',
  });
  expect(transcript.messages.at(-1)!.details).toBeUndefined();
  expect(transcript.messages[1].details).toBe('Disclosed rows');
});

it('replaces consecutive view-history notices with the latest result', () => {
  const transcript = new AiTranscript();
  transcript.update(state('completed', 'View updated.'));
  transcript.update(state('applying', 'Updating view…'));
  transcript.update(
    state(
      'completed',
      'Request removed. View updated. Sorted by Amount descending.',
    ),
  );
  transcript.update(state('applying', 'Updating view…'));
  transcript.update(state('completed', 'Request removed. View updated.'));
  expect(
    transcript.messages.map((message) => [message.from, message.text]),
  ).toEqual([
    ['user', 'Public request'],
    ['assistant', 'View updated.'],
    ['system', 'Request removed. View updated.'],
  ]);
});

it('retains bounded structured results as snapshots without duplicating raw details', () => {
  const transcript = new AiTranscript();
  const result = {
    kind: 'metrics' as const,
    title: 'Totals',
    items: [{ label: 'Amount', value: 100 }],
  };
  transcript.update({
    ...state('completed'),
    result,
    resultDetails: 'Raw JSON',
  });
  result.items[0].value = 200;
  expect(transcript.messages[1].result).toMatchObject({
    items: [{ value: 100 }],
  });
  expect(transcript.messages[1].details).toBeUndefined();
  transcript.update({ ...state('error', 'Independent error'), result });
  expect(transcript.messages.at(-1)?.result).toBeUndefined();
  transcript.update({
    ...state('completed'),
    result: { kind: 'text', title: 'Huge', text: 'x'.repeat(70000) },
  });
  expect(transcript.messages.at(-1)?.result).toBeUndefined();
});
