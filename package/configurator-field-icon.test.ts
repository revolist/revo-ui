import { expect, it } from 'vitest';
import { resolveConfiguratorFieldIcon } from '@revolist/ui/configurator-field-icon';

it('shares typed icons without inferring from names or overriding recognized column types', () => {
  const kinds = [
    'string',
    'number',
    'date',
    'currency',
    'percent',
    'time',
    'boolean',
    'id',
  ] as const;
  expect(
    new Set(
      kinds.map(
        (columnType) => resolveConfiguratorFieldIcon({ columnType }).svg,
      ),
    ).size,
  ).toBe(kinds.length);
  expect(
    resolveConfiguratorFieldIcon({ columnType: 'currency', dataType: 'number' })
      .kind,
  ).toBe('currency');
  expect(
    resolveConfiguratorFieldIcon({ columnType: 'custom', dataType: 'date' })
      .kind,
  ).toBe('date');
  expect(resolveConfiguratorFieldIcon().kind).toBe('string');
});
