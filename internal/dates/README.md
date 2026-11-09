# @revolist/dates

Private, framework-independent date, time, duration, and working-calendar utilities shared across RevoGrid products. This package is workspace-only; it is not published or separately installable. Products bundle the code and declarations they need.

```ts
import {
  parseIsoDate,
  formatIsoDate,
  type CalendarEntity,
} from '@revolist/dates';
import { parseLocalDateControlValue } from '@revolist/dates/date-controls';
import { parseTimelineInstantValue } from '@revolist/dates/timeline';
```

## Contracts

- ISO date-only math uses UTC midnight; local date/control helpers preserve local calendar fields. Do not substitute one for the other.
- Timeline instant parsing requires an explicit timezone for datetime strings; scheduler `parseDateTime` retains its existing UTC interpretation of zone-less datetime input.
- Civil date/time helpers operate on Gregorian fields and explicitly resolve IANA timezone boundaries, including DST gaps and repeated hours.
- Calendar math distinguishes clamped calendar-month shifts from native overflowing month arithmetic. Durations distinguish working time from elapsed time.
- Spreadsheet helpers preserve Excel serial-date conventions and locale-sensitive parsing.
- Sequence helpers preserve authored date/time formats and native UTC month overflow for autofill.
- Invalid-input behavior is helper-specific (`undefined`, `null`, invalid Date, or throw) and documented/tested at that helper. Extraction does not silently unify these contracts.
- Input Date values are cloned by coercion helpers. Date operations that return a new value do not mutate their inputs.

Root exports include the helper groups listed in `package.json`; explicit subpaths allow consumers to choose a narrow dependency. Calendar UI, scheduling policy, storage representations, error copy, and custom formatter callbacks belong to consumers.

## UTC trailing windows

Workspace consumers can use `resolveUtcCalendarWindow({ unit, count }, domain)`
from `@revolist/dates/calendar-range` or the root export. `UtcCalendarWindowUnit`
is `'day'`, `'week'`, `'month'` or `'year'`; count must be a positive safe integer.
The helper anchors to `domain.max`, preserves UTC time of day, clamps month/year
shifts at month end, intersects the supplied increasing domain and returns an
owned `{ min, max }` or `undefined` for invalid/unrepresentable windows. A week
is seven UTC days; a year is twelve calendar months. It does not mutate the
configuration or domain, use wall-clock time or interpret local civil dates.

Charts owns preset IDs, captions and its count limit of 10000. These are consumer
policies rather than restrictions on the generic dates helper. Built-in monthly
presets reuse the same calendar-window implementation.

## Migration

Import dates/calendar utilities directly from `@revolist/dates` or its explicit subpaths. Removed locations include `packages/pro/plugins/dates`, `packages/pro/plugins/calendars`, and `@revolist/chart-utils/dates/*`. Pro, Gantt, and Scheduler no longer re-export these utilities or shared types. There are no compatibility shims.

Public applications can infer calendar shapes from their product configuration types (for example `NonNullable<GanttPluginConfig['calendars']>[number]`) and supply explicit calendar definitions. The internal workspace package is not a public replacement dependency.

Use `workspace:*` development dependencies. Shared build tooling bundles runtime code and emits declarations under `_shared/dates`; published artifacts must not import this private package.

## Verification

Run `pnpm --filter @revolist/dates lint`, `pnpm --filter @revolist/dates test`, and `pnpm check:date-imports`. Run contracts with `TZ=UTC`, `TZ=Europe/Lisbon`, and `TZ=America/New_York` when changing local/civil behavior. Consumer tests retain feature-specific contracts.

## Consumer ownership audit

See [the package audit](docs/consumer-audit.md) for migrated helpers and the intentional differences retained in product code. Coercion clones Dates by default; read-only hot paths may explicitly opt out. Local control formatting supports minute or second precision.
