/** IDs for controls mounted in independent roots that share one document. */
export function createControlId(prefix = 'rv-control'): string {
  const id = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}`;
}
