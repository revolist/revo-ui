/** Presentation-only values. No HTML, grid records or executable render callbacks. */
export type AiResultValue = string | number | boolean | null;
interface ResultBase {
  title: string;
  description?: string;
}
export interface AiTableResult extends ResultBase {
  kind: 'table';
  columns: readonly { label: string; numeric?: boolean }[];
  rows: readonly (readonly AiResultValue[])[];
}
export interface AiMetricsResult extends ResultBase {
  kind: 'metrics';
  items: readonly { label: string; value: AiResultValue }[];
}
export interface AiTextResult extends ResultBase {
  kind: 'text';
  text: string;
}
/** Add new result kinds here and their renderer in AiResultView. */
export type AiResultContent = AiTableResult | AiMetricsResult | AiTextResult;

export function formatAiResultValue(value: AiResultValue): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number')
    return Number.isFinite(value) ? value.toLocaleString() : '—';
  return String(value);
}
