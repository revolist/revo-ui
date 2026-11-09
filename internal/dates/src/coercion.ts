/** Converts supported scalars to a valid Date; cloning can be disabled for read-only hot paths. */
export function coerceValidDate(
  value: unknown,
  cloneDate = true,
): Date | undefined {
  if (
    !(value instanceof Date) &&
    typeof value !== 'string' &&
    typeof value !== 'number'
  ) {
    return;
  }
  try {
    const date =
      value instanceof Date
        ? cloneDate
          ? new Date(value.getTime())
          : value
        : new Date(value as string | number);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return;
  }
}
