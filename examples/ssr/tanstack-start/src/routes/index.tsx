import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { SaveButton } from '../save-button';

const getReport = createServerFn().handler(() => ({
  title: 'TanStack Start report',
}));

export const Route = createFileRoute('/')({
  loader: () => getReport(),
  component: Home,
});

function Home() {
  const report = Route.useLoaderData();
  return (
    <main>
      <h1>{report.title}</h1>
      <p>This title comes from a server function.</p>
      <SaveButton />
    </main>
  );
}
