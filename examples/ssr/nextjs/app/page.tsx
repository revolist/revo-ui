import { SaveButton } from './save-button';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <main>
      <h1>Next.js report</h1>
      <p>This text is rendered on the server.</p>
      <SaveButton />
    </main>
  );
}
