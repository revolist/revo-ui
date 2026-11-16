'use client';

import { useState } from 'react';
import { useUpdate } from '@refinedev/core';
import { SvgButton } from '@revolist/ui/react/unstyled';

export function ReportForm() {
  const [title, setTitle] = useState('Quarterly report');
  const [count, setCount] = useState(0);
  const { mutate, mutation } = useUpdate();

  function save() {
    mutate(
      { resource: 'reports', id: 1, values: { title } },
      { onSuccess: () => setCount((value) => value + 1) },
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <label>
        Report title{' '}
        <input
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <SvgButton
        type="submit"
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        disabled={mutation.isPending}
      />
      {mutation.isError && <p role="alert">Could not save. Try again.</p>}
      <p role="status">
        {count ? `Saved ${count} time(s).` : 'Ready to save.'}
      </p>
    </form>
  );
}
