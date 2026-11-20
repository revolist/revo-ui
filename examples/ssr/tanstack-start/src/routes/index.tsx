import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { SvgButton } from '@revolist/ui/react/unstyled';

const getReport = createServerFn().handler(() => ({
  title: 'TanStack Start report',
}));

export const Route = createFileRoute('/')({
  loader: () => getReport(),
  component: Home,
});

function Home() {
  const [count, setCount] = useState(0);
  const report = Route.useLoaderData();
  return (
    <main>
      <h1>{report.title}</h1>
      <p>This title comes from a server function.</p>
      <SvgButton
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        onClick={() => setCount((value) => value + 1)}
      />
    </main>
  );
}
