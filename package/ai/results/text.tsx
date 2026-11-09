import { h } from 'preact';
import type { AiTextResult } from './types';

export function AiResultText({ result }: { result: AiTextResult }) {
  return (
    <section class="rv-ai-result-content" aria-label={result.title}>
      <strong>{result.title}</strong>
      {result.description && (
        <p class="rv-ai-result-description">{result.description}</p>
      )}
      <p class="rv-ai-result-text">{result.text}</p>
    </section>
  );
}
