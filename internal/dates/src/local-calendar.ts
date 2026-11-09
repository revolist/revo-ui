/** Returns a new local calendar boundary, preserving local DST rules. */
export function startOfLocalCalendarUnit(
  value: Date,
  unit: 'day' | 'month' | 'quarter' | 'year',
): Date {
  const date = new Date(value.getTime());
  date.setHours(0, 0, 0, 0);
  if (unit !== 'day') date.setDate(1);
  if (unit === 'quarter') date.setMonth(Math.floor(date.getMonth() / 3) * 3);
  if (unit === 'year') date.setMonth(0);
  return date;
}

/** Local calendar-day arithmetic, preserving wall-clock time across DST. */
export function addLocalCalendarDays(value: Date, days: number): Date {
  const date = new Date(value.getTime());
  date.setDate(date.getDate() + days);
  return date;
}

/** Local calendar-month arithmetic with native Date overflow semantics. */
export function addLocalCalendarMonths(value: Date, months: number): Date {
  const date = new Date(value.getTime());
  date.setMonth(date.getMonth() + months);
  return date;
}
