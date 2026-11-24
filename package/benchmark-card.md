# Benchmark card content

`createBenchmarkCardContent(document, content)` creates a presentation-only comparison card suitable for a tooltip, popover, or inline detail view. The host provides the title and value plus optional description, badge, detail, change, comparison text and progress. All text and formatted numbers are supplied by the host, so the component adds no fixed language or domain-specific assumptions.

```ts
import { createBenchmarkCardContent } from '@revolist/ui/benchmark-card';

const content = createBenchmarkCardContent(document, {
  title: 'First response',
  description: 'Responses within one day',
  value: '85%',
  detail: '548 of 642 responses',
  change: '+10 points',
  changeTone: 'positive',
  benchmark: 'Team average 75%',
  progress: { value: 85, label: 'Response rate 85%' },
});
```

The progress bar uses the shared progress primitive and accepts optional `min` and `max`. Non-finite values fall back to a finite lower bound. The returned node does not open or position itself and does not assign a tooltip or dialog role; the host surface owns those semantics, lifecycle, focus and positioning. Use the UI styles bundle or import `@revolist/ui/benchmark-card.scss`; override `--rv-benchmark-*` variables to fit the host theme. Text is rendered as text, not HTML.

For a RevoGrid tooltip, return the node from `TooltipPlugin`'s `renderContent` callback, using the callback's owner document and supplying `data-tooltip` on the trigger. Enable `anchorToTarget` when an anchored card is desired; Pro can additionally set `anchorAlignment` and `anchorGap`. The Pro tooltip associates the rendered surface with its trigger and removes its own description token when hidden.
