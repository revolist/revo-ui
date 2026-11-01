import { h } from 'preact';
import {
  AiResultTable,
  AiResultMetrics,
  AiResultText,
} from '@revolist/ui/preact';
import { Example } from './catalog';

/** Independent result presentations, using explicit sample data only. */
export function AiResultsExample() {
  return (
    <>
      <Example title="AI result table">
        <AiResultTable
          result={{
            kind: 'table',
            title: 'Visible summary',
            description: '46 visible records · Sum of Amount by Region',
            columns: [
              { label: 'Region' },
              { label: 'Amount (Sum)', numeric: true },
              { label: 'Records', numeric: true },
            ],
            rows: [
              ['Americas', 40205, 15],
              ['Asia', 43338, 15],
              ['Europe', 42260, 16],
            ],
          }}
        />
      </Example>
      <Example title="AI result metrics">
        <AiResultMetrics
          result={{
            kind: 'metrics',
            title: 'Visible totals',
            description: 'Sample disclosed aggregate',
            items: [
              { label: 'Amount (Sum)', value: 125803 },
              { label: 'Records', value: 46 },
            ],
          }}
        />
      </Example>
      <Example title="AI result text">
        <AiResultText
          result={{
            kind: 'text',
            title: 'Result note',
            text: 'These results describe the visible view. No raw records were disclosed.',
          }}
        />
      </Example>
    </>
  );
}
