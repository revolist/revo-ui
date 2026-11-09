import { getPossibleInstants, parseIsoCivilDate } from './civil-time';
import { assertIanaTimeZone, parseTimeOfDay } from './time-of-day';

export interface CivilSessionCalendarInput {
  timeZone: string;
  disambiguation?: 'reject' | 'earlier' | 'later';
  sessions: readonly {
    date: string;
    open: string;
    close: string;
    endDate?: string;
  }[];
}
export interface InstantSessionCalendar {
  timeZone: string;
  sessions: { open: number; close: number }[];
}
/** Explicit civil sessions only. Missing/ambiguous times never acquire an implicit offset. */
export function createSessionCalendar(
  input: CivilSessionCalendarInput,
): InstantSessionCalendar {
  assertIanaTimeZone(input.timeZone);
  const choice = input.disambiguation ?? 'reject';
  if (
    !['reject', 'earlier', 'later'].includes(choice) ||
    !Array.isArray(input.sessions) ||
    !input.sessions.length ||
    input.sessions.length > 100000
  )
    throw new RangeError('Invalid session calendar.');
  const instant = (date: string, clock: string) => {
    const day = parseIsoCivilDate(date);
    const match =
      typeof clock === 'string' && /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(clock);
    if (!day || !match) throw new RangeError('Invalid session date or clock.');
    const totalMinutes = parseTimeOfDay(`${match[1]}:${match[2]}`);
    const hour = Math.floor(totalMinutes / 60),
      minute = totalMinutes % 60,
      second = Number(match[3] ?? 0);
    if (second > 59) throw new RangeError('Invalid session clock.');
    const possible = getPossibleInstants(
      { ...day, hour, minute, second },
      input.timeZone,
    );
    if (!possible.length || (possible.length > 1 && choice === 'reject'))
      throw new RangeError('Session boundary is skipped or ambiguous.');
    return possible[choice === 'later' ? possible.length - 1 : 0].getTime();
  };
  let previous = -Infinity;
  const sessions = input.sessions.map((session) => {
    const open = instant(session.date, session.open),
      close = instant(session.endDate ?? session.date, session.close);
    if (open >= close || open < previous)
      throw new RangeError(
        'Sessions must be ordered, positive and nonoverlapping.',
      );
    previous = close;
    return { open, close };
  });
  return { timeZone: input.timeZone, sessions };
}
