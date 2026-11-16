import { ReportEditor } from './report-editor';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <main>
      <h1>Refine report</h1>
      <p>Edit one report with Refine and Revo UI.</p>
      <ReportEditor />
    </main>
  );
}
