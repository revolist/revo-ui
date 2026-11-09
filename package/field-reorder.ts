/** Move an item to a boundary in the original list (0 = before first, length = after last). */
export function reorderFields<T>(
  items: readonly T[],
  from: number,
  boundary: number,
): T[] {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(boundary) ||
    from < 0 ||
    from >= items.length ||
    boundary < 0 ||
    boundary > items.length ||
    from === boundary ||
    from + 1 === boundary
  )
    return items as T[];
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(from < boundary ? boundary - 1 : boundary, 0, item);
  return next;
}

/** Shared midpoint hit testing, with a stable side while the pointer crosses the dead zone. */
export function fieldDropIndex(
  pointer: number,
  start: number,
  size: number,
  index: number,
  previous: number | null = null,
  tolerance = 4,
): number {
  const midpoint = start + size / 2;
  if (
    Math.abs(pointer - midpoint) <= tolerance &&
    (previous === index || previous === index + 1)
  )
    return previous;
  return pointer <= midpoint ? index : index + 1;
}

/** Resolves list background and inter-row gaps using the same boundaries as row hit testing. */
export function fieldListDropIndex(
  pointer: number,
  rows: readonly { top: number; height: number }[],
  previous: number | null = null,
  endBoundary = rows.length,
): number {
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (pointer <= row.top + row.height)
      return fieldDropIndex(pointer, row.top, row.height, index, previous);
  }
  return endBoundary;
}
