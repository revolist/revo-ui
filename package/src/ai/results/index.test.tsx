import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it } from 'vitest';
import { AiResultView } from './index';

afterEach(() => act(() => render(null, document.body)));
it('renders labeled aggregate tables with formatted values and safe text', () => {
  act(() =>
    render(
      <AiResultView
        result={{
          kind: 'table',
          title: 'Visible summary',
          description: '46 visible records',
          columns: [
            { label: 'Region' },
            { label: 'Amount (sum)', numeric: true },
          ],
          rows: [
            ['Europe', 42260],
            ['<img src=x onerror=alert(1)>', null],
          ],
        }}
      />,
      document.body,
    ),
  );
  expect(document.querySelector('caption')?.textContent).toContain(
    '46 visible records',
  );
  expect(
    [...document.querySelectorAll('th')].map((cell) => cell.textContent),
  ).toEqual(['Region', 'Amount (sum)']);
  expect(document.body.textContent).toContain((42260).toLocaleString());
  expect(document.body.textContent).toContain('—');
  expect(document.querySelector('img')).toBeNull();
  expect(document.querySelector('pre')).toBeNull();
});
it('renders empty tables, metrics and text through separate components', () => {
  act(() =>
    render(
      <AiResultView
        result={{
          kind: 'table',
          title: 'Rows',
          columns: [{ label: 'Amount' }],
          rows: [],
        }}
      />,
      document.body,
    ),
  );
  expect(document.body.textContent).toContain('No results');
  act(() =>
    render(
      <AiResultView
        result={{
          kind: 'metrics',
          title: 'Totals',
          items: [{ label: 'Amount', value: 1000 }],
        }}
      />,
      document.body,
    ),
  );
  expect(document.querySelector('dt')?.textContent).toBe('Amount');
  expect(document.querySelector('dd')?.textContent).toBe(
    (1000).toLocaleString(),
  );
  act(() =>
    render(
      <AiResultView
        result={{
          kind: 'text',
          title: 'Details',
          text: '<script>unsafe()</script>',
        }}
      />,
      document.body,
    ),
  );
  expect(document.body.textContent).toContain('<script>unsafe()</script>');
  expect(document.querySelector('script')).toBeNull();
});

it('lets a trusted host supply the table renderer without changing result data', () => {
  const result = {
    kind: 'table' as const,
    title: 'Records',
    columns: [{ label: 'Name' }],
    rows: [['Ada']],
  };
  act(() =>
    render(
      <AiResultView
        result={result}
        renderTable={(table) => <div data-host-table>{table.title}</div>}
      />,
      document.body,
    ),
  );
  expect(document.querySelector('[data-host-table]')?.textContent).toBe(
    'Records',
  );
  expect(document.querySelector('table')).toBeNull();
});
