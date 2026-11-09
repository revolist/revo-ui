export interface DelimitedFormatOptions {
  columnDelimiter: string;
  rowDelimiter: string;
}
const DOUBLE_QUOTE = '"';
export function encodeDelimitedCell(
  value: unknown,
  options: DelimitedFormatOptions,
  force = false,
  beforeEncode?: (serialized: string, quoted: boolean) => void,
) {
  const serialized = stringifyCellValue(value);
  if (typeof serialized === 'undefined') {
    return '';
  }

  const mustQuote =
    force ||
    serialized.includes(options.columnDelimiter) ||
    serialized.includes(options.rowDelimiter) ||
    serialized.includes('\r') ||
    serialized.includes('\n') ||
    serialized.includes(DOUBLE_QUOTE);

  beforeEncode?.(serialized, mustQuote);
  if (!mustQuote) {
    return serialized;
  }

  return `"${serialized.replace(/"/g, '""')}"`;
}

function stringifyCellValue(value: unknown): string | undefined {
  if (typeof value === 'undefined') {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value === null) {
    return 'null';
  }
  if (
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }
  const json = JSON.stringify(value);
  return typeof json === 'string' ? json : String(value);
}
