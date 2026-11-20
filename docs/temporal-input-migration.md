# Migrate native date and time inputs

The native `DateInput`, `TimeInput`, and `DateTimeInput` wrappers have been removed. Use `DateTimeField` with `kind="date"`, `kind="time"`, or `kind="datetime"` for editable fields with the shared picker. The field uses text entry and emits the updated value through `onValueChange`.

```tsx
import { useState } from 'react';
import { DateTimeField } from '@revolist/ui/react';

export function DueDate() {
  const [value, setValue] = useState('2026-11-20');
  return (
    <DateTimeField
      aria-label="Due date"
      kind="date"
      value={value}
      onValueChange={setValue}
    />
  );
}
```

Use ISO values such as `2026-11-20`, `09:30`, or `2026-11-20T09:30` for the respective kinds. For calendar-only and range selection, see [DatePicker](api/DatePicker.md), [DateRangePicker](api/DateRangePicker.md), and [DateTimeField](api/DateTimeField.md). The shared picker accepts localized labels, constraints, and time precision through its options.
