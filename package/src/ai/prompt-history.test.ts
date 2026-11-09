import { expect, it } from 'vitest';
import { AiPromptRecall, boundAiPromptHistory } from './prompt-history';

it('recalls newest prompts first and restores the current draft after the latest', () => {
  const recall = new AiPromptRecall();
  const items = ['First', 'Second'];
  expect(recall.move('Draft', 'down', items)).toBeUndefined();
  expect(recall.move('Draft', 'up', items)).toBe('Second');
  expect(recall.move('Second', 'up', items)).toBe('First');
  expect(recall.move('First', 'up', items)).toBe('First');
  expect(recall.move('First', 'down', items)).toBe('Second');
  expect(recall.move('Second', 'down', items)).toBe('Draft');
  expect(recall.move('Changed draft', 'up', items)).toBe('Second');
  expect(recall.move('Second', 'up', ['New list'])).toBe('New list');
});
it('bounds stored prompts by count and bytes, omitting oversized prompts and adjacent duplicates', () => {
  expect(
    boundAiPromptHistory(
      Array.from({ length: 25 }, (_, index) => String(index)),
    ),
  ).toEqual(Array.from({ length: 20 }, (_, index) => String(index + 5)));
  expect(
    boundAiPromptHistory([' first ', 'first', '', '界'.repeat(4000), 'last']),
  ).toEqual(['first', 'last']);
  const result = boundAiPromptHistory(
    Array.from({ length: 20 }, (_, index) => `${index}${'界'.repeat(500)}`),
  );
  expect(
    new TextEncoder().encode(JSON.stringify(result)).byteLength,
  ).toBeLessThanOrEqual(8192);
  expect(boundAiPromptHistory([null, 12, {}, 'Valid'] as never)).toEqual([
    'Valid',
  ]);
});
