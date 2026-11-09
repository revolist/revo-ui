import textIcon from '@fortawesome/fontawesome-free/svgs/solid/font.svg?raw';
import numberIcon from '@fortawesome/fontawesome-free/svgs/solid/hashtag.svg?raw';
import percentIcon from '@fortawesome/fontawesome-free/svgs/solid/percent.svg?raw';
import currencyIcon from '@fortawesome/fontawesome-free/svgs/solid/dollar-sign.svg?raw';
import dateIcon from '@fortawesome/fontawesome-free/svgs/solid/calendar-days.svg?raw';
import timeIcon from '@fortawesome/fontawesome-free/svgs/regular/clock.svg?raw';
import booleanIcon from '@fortawesome/fontawesome-free/svgs/solid/toggle-on.svg?raw';
import keyIcon from '@fortawesome/fontawesome-free/svgs/solid/key.svg?raw';

export interface ConfiguratorFieldMetadata {
  columnType?: string;
  dataType?: 'string' | 'number' | 'date' | 'boolean';
}

const fieldIcons: Record<string, { svg: string; label: string }> = {
  string: { svg: textIcon, label: 'string' },
  number: { svg: numberIcon, label: 'number' },
  integer: { svg: numberIcon, label: 'integer' },
  decimal: { svg: numberIcon, label: 'decimal' },
  percent: { svg: percentIcon, label: 'percent' },
  currency: { svg: currencyIcon, label: 'currency' },
  date: { svg: dateIcon, label: 'date' },
  time: { svg: timeIcon, label: 'time' },
  boolean: { svg: booleanIcon, label: 'boolean' },
  id: { svg: keyIcon, label: 'id' },
};

/** Shared descriptive field identity; never infers or formats source values. */
export function resolveConfiguratorFieldIcon(
  dimension?: ConfiguratorFieldMetadata,
) {
  const kind =
    dimension?.columnType && Object.hasOwn(fieldIcons, dimension.columnType)
      ? dimension.columnType
      : (dimension?.dataType ?? 'string');
  const icon = fieldIcons[kind] ?? fieldIcons.string;
  return { ...icon, kind };
}
