import type { ISODateString } from '@revolist/ui-dates';
import { DEFAULT_CALENDAR_TRANSLATIONS } from './translations';
import type {
  CalendarProps,
  CalendarSelectionValidationContext,
  CalendarView,
} from './types';

export function getCalendarViews(
  props: Pick<CalendarProps, 'views' | 'enableYearView'>,
): readonly CalendarView[] {
  if (!props.views)
    return props.enableYearView === false ? ['month'] : ['month', 'year'];
  const views = props.views.filter(
    (view) => view === 'month' || view === 'year',
  );
  return views.length ? [...new Set(views)] : ['month'];
}

export function getCalendarSelectionError(
  props: Pick<CalendarProps, 'translations' | 'validateSelection'>,
  date: ISODateString,
  context: CalendarSelectionValidationContext,
  disabled: boolean,
): string | undefined {
  const invalid =
    props.translations?.invalidSelection ??
    DEFAULT_CALENDAR_TRANSLATIONS.invalidSelection;
  if (disabled) return invalid;
  const result = props.validateSelection?.(date, context);
  if (result === false) return invalid;
  if (typeof result === 'string') return result;
}
