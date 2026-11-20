import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SvgButton } from '@revolist/ui/react/unstyled';
import '@revolist/ui/styles/base.css';

function App() {
  const [count, setCount] = useState(0);
  return (
    <main>
      <h1>React/Vite report</h1>
      <p>This legacy Lovable-style example renders in the browser.</p>
      <SvgButton
        label={`Save ${count}`}
        visibleLabel={`Save ${count}`}
        onClick={() => setCount((value) => value + 1)}
      />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
