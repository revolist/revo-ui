import type { ClassPreset } from '../../presets/types';
import { h, type ComponentChildren } from 'preact';
import { AiResultTable } from './table';
import { AiResultMetrics } from './metrics';
import { AiResultText } from './text';
import type { AiResultContent, AiTableResult } from './types';
export type AiTableRenderer = (result: AiTableResult) => ComponentChildren;
export * from './types';
export * from './table';
export * from './metrics';
export * from './text';

export function AiResultView({
  preset,
  className,
  result,
  renderTable,
}: {
  preset?: ClassPreset;
  className?: string;
  result: AiResultContent;
  renderTable?: AiTableRenderer;
}) {
  switch (result.kind) {
    case 'table':
      return renderTable ? (
        renderTable(result)
      ) : (
        <AiResultTable result={result} preset={preset} className={className} />
      );
    case 'metrics':
      return (
        <AiResultMetrics
          result={result}
          preset={preset}
          className={className}
        />
      );
    case 'text':
      return (
        <AiResultText result={result} preset={preset} className={className} />
      );
  }
}
