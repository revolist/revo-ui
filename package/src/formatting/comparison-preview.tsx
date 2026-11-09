import { TooltipText } from '../core/tooltip-text';
/** @jsxImportSource preact */
import { h, type ComponentChildren, type JSX } from 'preact';
/** Pure comparison presentation; the caller formats values and styles. */
export function ComparisonPreview({
  originalValue,
  formatted,
  formattedStyle,
  visual = false,
  formattedClassName = '',
  labels,
}: {
  readonly originalValue: string;
  readonly formatted: ComponentChildren;
  readonly formattedStyle?: JSX.CSSProperties;
  readonly visual?: boolean;
  readonly formattedClassName?: string;
  readonly labels: {
    readonly title: string;
    readonly original: string;
    readonly formatted: string;
    readonly hint: string;
  };
}) {
  return (
    <section
      class={`rv-format-preview${visual ? ' rv-format-preview--visual' : ''}`}
    >
      <h3 class="rv-format-pane-title">{labels.title}</h3>
      <div
        class="rv-format-preview__grid"
        role="table"
        aria-label={labels.title}
      >
        <div class="rv-format-preview__row" role="row">
          <span class="rv-format-preview__corner" role="cell" />
          <span class="rv-format-preview__columnheader" role="columnheader">
            {labels.original}
          </span>
          <span class="rv-format-preview__columnheader" role="columnheader">
            {labels.formatted}
          </span>
        </div>
        <div class="rv-format-preview__row" role="row">
          <span class="rv-format-preview__rowheader" role="rowheader">
            1
          </span>
          <TooltipText
            class="rv-format-preview__gridcell"
            role="cell"
            title={originalValue}
          >
            <span class="rv-format-preview__original-value">
              {originalValue}
            </span>
          </TooltipText>
          <span
            class={`rv-format-preview__gridcell rv-format-preview__formatted ${formattedClassName}`}
            role="cell"
            style={formattedStyle}
          >
            <span role="status" aria-live="polite">
              {formatted}
            </span>
          </span>
        </div>
      </div>
      <p class="rv-format-preview__hint">{labels.hint}</p>
    </section>
  );
}
