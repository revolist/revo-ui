/** Recall stays local to the UI; it never becomes model conversation automatically. */
export interface AiPromptHistoryOptions {
  /** Initial prompts loaded by the host from its preferred storage. Newest comes last. */
  items?: readonly string[];
  /** Optional host-owned persistence. No browser storage is read or written by the component. */
  onChange?(items: readonly string[]): void;
}

export function boundAiPromptHistory(items: readonly string[]): string[] {
  if (!Array.isArray(items)) return [];
  const valid = items
    .slice(-20)
    .filter(
      (item): item is string =>
        typeof item === 'string' && !!item.trim() && item.length <= 4000,
    )
    .map((item) => item.trim())
    .filter((item, index, values) => !index || item !== values[index - 1]);
  const result: string[] = [];
  for (let index = valid.length - 1; index >= 0; index--)
    if (
      new TextEncoder().encode(JSON.stringify([valid[index], ...result]))
        .byteLength <= 8192
    )
      result.unshift(valid[index]);
  return result;
}

export class AiPromptRecall {
  private state?: {
    index: number;
    draft: string;
    selected: string;
    key: string;
  };
  reset() {
    this.state = undefined;
  }
  move(
    value: string,
    direction: 'up' | 'down',
    items: readonly string[],
  ): string | undefined {
    const key = JSON.stringify(items);
    if (this.state && (this.state.selected !== value || this.state.key !== key))
      this.reset();
    if (!items.length || (!this.state && direction === 'down')) return;
    if (!this.state)
      this.state = { index: items.length, draft: value, selected: value, key };
    const index = this.state.index + (direction === 'up' ? -1 : 1);
    if (index >= items.length) {
      const draft = this.state.draft;
      this.reset();
      return draft;
    }
    this.state.index = Math.max(0, index);
    this.state.selected = items[this.state.index];
    return this.state.selected;
  }
}
