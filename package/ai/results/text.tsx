import type { ClassPreset } from '../../presets/types';
import { h } from 'preact';
import type { AiTextResult } from './types';

export function AiResultText({
  result,
  preset,
  className = '',
}: {
  result: AiTextResult;
  preset?: ClassPreset;
  className?: string;
}) {
  return (
    <section
      class={`rv-ai-result-content ${preset?.className ?? ''} ${className}`}
      data-part="root"
      aria-label={result.title}
    >
      <strong>{result.title}</strong>
      {result.description && (
        <p class="rv-ai-result-description">{result.description}</p>
      )}
      <p class="rv-ai-result-text">{result.text}</p>
    </section>
  );
}
