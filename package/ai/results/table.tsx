import { h } from 'preact';
import { useAiText } from '../translation-context';
import { formatAiResultValue, type AiTableResult } from './types';

export function AiResultTable({ result }: { result: AiTableResult }) {
  const t = useAiText();
  return (
    <section class="rv-ai-result-content" aria-label={result.title}>
      <div
        class="rv-ai-result-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={result.title}
      >
        <table class="rv-ai-result-table">
          <caption>
            <strong>{result.title}</strong>
            {result.description && <span>{result.description}</span>}
          </caption>
          <thead>
            <tr>
              {result.columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  class={column.numeric ? 'rv-ai-result-number' : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, index) => (
              <tr key={index}>
                {result.columns.map((column, cell) => (
                  <td
                    key={cell}
                    class={column.numeric ? 'rv-ai-result-number' : undefined}
                  >
                    {formatAiResultValue(row[cell])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!result.rows.length && (
          <p class="rv-ai-result-empty">{t('No results')}</p>
        )}
      </div>
    </section>
  );
}
