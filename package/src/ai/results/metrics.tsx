import { h } from 'preact';
import { formatAiResultValue, type AiMetricsResult } from './types';

export function AiResultMetrics({ result }: { result: AiMetricsResult }) {
  return (
    <section class="rv-ai-result-content" aria-label={result.title}>
      <strong>{result.title}</strong>
      {result.description && (
        <p class="rv-ai-result-description">{result.description}</p>
      )}
      <dl class="rv-ai-result-metrics">
        {result.items.map((item, index) => (
          <div key={index}>
            <dt>{item.label}</dt>
            <dd>{formatAiResultValue(item.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
