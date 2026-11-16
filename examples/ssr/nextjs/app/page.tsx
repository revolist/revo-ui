'use client';

import { useState } from 'react';
import { SvgButton } from '@revolist/ui/react/unstyled';

export default function Page() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>Next.js report</h1>
      <p>This text is rendered on the server.</p>
      <SvgButton
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        onClick={() => setCount((value) => value + 1)}
      />
    </main>
  );
}
