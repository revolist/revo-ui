'use client';

import { useState } from 'react';
import { Refine, useUpdate } from '@refinedev/core';
import dataProvider from '@refinedev/simple-rest';
import { SvgButton } from '@revolist/ui/react/unstyled';

const provider = dataProvider('/api');

export default function Page() {
  return (
    <Refine
      dataProvider={provider}
      resources={[{ name: 'reports' }]}
      options={{ disableTelemetry: true }}
    >
      <main>
        <h1>Refine report</h1>
        <p>Edit one report with Refine and Revo UI.</p>
        <ReportForm />
      </main>
    </Refine>
  );
}

function ReportForm() {
  const [title, setTitle] = useState('Quarterly report');
  const [count, setCount] = useState(0);
  const { mutate, mutation } = useUpdate();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        mutate(
          { resource: 'reports', id: 1, values: { title } },
          { onSuccess: () => setCount((value) => value + 1) },
        );
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
