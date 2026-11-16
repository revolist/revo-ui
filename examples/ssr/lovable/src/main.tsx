import { createRoot } from 'react-dom/client';
import '@revolist/ui/styles/base.css';
import { SaveButton } from './save-button';

createRoot(document.getElementById('root')!).render(
  <main>
    <h1>React/Vite report</h1>
    <p>This legacy Lovable-style example renders in the browser.</p>
    <SaveButton />
  </main>,
);
