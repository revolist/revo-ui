import { useLoaderData } from 'react-router';
import { SaveButton } from '../save-button';

export function loader() {
  return { title: 'React Router report' };
}

export default function Home() {
  const { title } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>{title}</h1>
      <p>This title comes from the server loader.</p>
      <SaveButton />
    </main>
  );
}
