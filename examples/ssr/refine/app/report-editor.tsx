'use client';

import { Refine } from '@refinedev/core';
import dataProvider from '@refinedev/simple-rest';
import { ReportForm } from './report-form';

const provider = dataProvider('/api');

export function ReportEditor() {
  return (
    <Refine
      dataProvider={provider}
      resources={[{ name: 'reports' }]}
      options={{ disableTelemetry: true }}
    >
      <ReportForm />
    </Refine>
  );
}
