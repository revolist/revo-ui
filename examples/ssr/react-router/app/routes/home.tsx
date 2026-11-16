import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { SvgButton } from '@revolist/ui/react/unstyled';

export function loader() {
  return { title: 'React Router report' };
}

export default function Home() {
  const [count, setCount] = useState(0);
  const { title } = useLoaderData<typeof loader>();
  return (
    <main>
      <h1>{title}</h1>
      <p>This title comes from the server loader.</p>
      <SvgButton
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        onClick={() => setCount((value) => value + 1)}
      />
    </main>
  );
}
