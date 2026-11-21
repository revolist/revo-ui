export interface HistoryCell {
  /** Stable cell identifier across snapshots, including its sheet when applicable. */
  id: string;
  /** Display address, such as B4. */
  address: string;
  /** Optional sheet display name. */
  sheet?: string;
  /** Display-ready cell value. A null value represents an empty cell. */
  value: string | null;
}

export interface HistoryCellChange {
  cell: HistoryCell;
  before: string | null;
  after: string | null;
}

/** Compare display values by stable cell ID, including clears and new cells. */
export function compareHistoryCells(
  before: readonly HistoryCell[],
  after: readonly HistoryCell[],
): HistoryCellChange[] {
  const earlier = new Map(before.map((cell) => [cell.id, cell]));
  const changes: HistoryCellChange[] = [];
  for (const cell of after) {
    const oldValue = earlier.get(cell.id)?.value ?? null;
    earlier.delete(cell.id);
    if (oldValue !== cell.value)
      changes.push({ cell, before: oldValue, after: cell.value });
  }
  for (const cell of earlier.values()) {
    if (cell.value !== null)
      changes.push({ cell, before: cell.value, after: null });
  }
  return changes;
}
