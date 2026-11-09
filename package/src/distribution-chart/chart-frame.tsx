import { TooltipText } from '../core/tooltip-text';
/** @jsxImportSource preact */
import { Fragment, h, type ComponentChildren, type JSX } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { useTooltip } from '../core/tooltip';
import { chartGeometry } from './geometry';
import type {
  DistributionChartDatum,
  DistributionChartTooltip,
  DistributionChartType,
  StandaloneChartProps,
} from './types';

export interface ChartPoint {
  readonly x: number;
  readonly y: number;
}

function tooltipText({ title, details = [] }: DistributionChartTooltip) {
  return [title, ...details].filter(Boolean).join('. ');
}

function defaultTooltip({ title, details = [] }: DistributionChartTooltip) {
  return (
    <>
      <strong>{title}</strong>
      {details.map((detail) => (
        <span key={detail}>{detail}</span>
      ))}
    </>
  );
}

/** Shared accessibility, focus and tooltip lifecycle for the chart primitives. */
export function ChartFrame({
  data,
  ariaLabel,
  variant,
  height = 72,
  className = '',
  showGrid = false,
  showLabels = false,
  showValues = false,
  legend,
  formatValue = String,
  tooltip = true,
  tooltipIndicator = 'none',
  renderTooltip,
  positions,
  datumColors,
  renderDatum,
  children,
}: StandaloneChartProps & {
  variant: DistributionChartType;
  positions?: readonly ChartPoint[];
  datumColors?: readonly (string | undefined)[];
  renderDatum: (
    datum: DistributionChartDatum,
    index: number,
  ) => ComponentChildren;
  children?: ComponentChildren;
}) {
  const { values, max } = chartGeometry(data);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const activeIndex = Math.min(focusedIndex, Math.max(0, data.length - 1));

  const focusItem = (index: number) => {
    if (!data.length) return;
    const next = Math.max(0, Math.min(index, data.length - 1));
    setFocusedIndex(next);
    itemRefs.current[next]?.focus();
  };

  return (
    <div
      class={`rv-distribution-chart rv-distribution-chart--${variant} ${className}`.trim()}
      role="group"
      aria-label={ariaLabel}
      data-empty={data.length ? undefined : 'true'}
    >
      <div
        class="rv-distribution-chart__region"
        style={{ height: `${Math.max(40, Math.min(240, height))}px` }}
      >
        {showGrid && (
          <div class="rv-distribution-chart__grid" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((tick) => (
              <span key={tick} />
            ))}
          </div>
        )}
        {children}
        <div class="rv-distribution-chart__data" role="list">
          {data.map((datum, index) => {
            const point = positions?.[index];
            const isBar = !point;
            return (
              <TooltipDatum
                key={datum.key}
                indicator={tooltipIndicator}
                tooltipText={tooltip ? tooltipText(datum.tooltip) : undefined}
                tooltipContent={
                  renderTooltip
                    ? renderTooltip(datum, index)
                    : defaultTooltip(datum.tooltip)
                }
                datumRef={(element) => {
                  itemRefs.current[index] = element;
                }}
                class={`rv-distribution-chart__datum${datum.selected ? ' is-selected' : ''}${isBar ? ' is-bar' : ' is-point'}`}
                role="listitem"
                tabIndex={index === activeIndex ? 0 : -1}
                aria-label={tooltipText(datum.tooltip)}
                style={{
                  '--rv-distribution-accent': datumColors?.[index],
                  ...(isBar
                    ? {}
                    : { left: `${point!.x}%`, top: `${point!.y}%` }),
                }}
                onFocus={() => setFocusedIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    event.preventDefault();
                    focusItem(index + 1);
                  } else if (
                    event.key === 'ArrowLeft' ||
                    event.key === 'ArrowUp'
                  ) {
                    event.preventDefault();
                    focusItem(index - 1);
                  } else if (event.key === 'Home') {
                    event.preventDefault();
                    focusItem(0);
                  } else if (event.key === 'End') {
                    event.preventDefault();
                    focusItem(data.length - 1);
                  }
                }}
              >
                {renderDatum(datum, index)}
                {showValues && (
                  <span
                    class="rv-distribution-chart__value"
                    style={
                      isBar
                        ? {
                            top: `${100 - Math.max(3, (values[index] / max) * 100)}%`,
                            transform: 'translate(-50%, -100%)',
                          }
                        : undefined
                    }
                    aria-hidden="true"
                  >
                    {formatValue(datum.value)}
                  </span>
                )}
              </TooltipDatum>
            );
          })}
        </div>
      </div>
      {showLabels && (
        <div
          class={`rv-distribution-chart__labels${variant === 'bar' ? ' is-bar' : ''}`}
          aria-hidden="true"
        >
          {data.map((datum) => (
            <TooltipText key={datum.key} title={datum.tooltip.title}>
              {datum.tooltip.title}
            </TooltipText>
          ))}
        </div>
      )}
      {legend && (
        <div class="rv-distribution-chart__legend">
          <i aria-hidden="true" />
          {legend}
        </div>
      )}
    </div>
  );
}

export function ChartPlot({ children }: { children: ComponentChildren }) {
  return (
    <svg
      class="rv-distribution-chart__plot"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function TooltipDatum({
  tooltipText,
  tooltipContent,
  indicator,
  children,
  onFocus,
  onKeyDown,
  datumRef,
  ...attributes
}: JSX.HTMLAttributes<HTMLSpanElement> & {
  tooltipText?: string;
  tooltipContent: ComponentChildren;
  datumRef: (element: HTMLSpanElement | null) => void;
  indicator: NonNullable<StandaloneChartProps['tooltipIndicator']>;
}) {
  const hint = useTooltip(tooltipText ?? '', true, {
    className: `rv-distribution-chart__tooltip rv-distribution-chart__tooltip--${indicator}`,
    content: (
      <>
        {indicator !== 'none' && <i aria-hidden="true" />}
        {tooltipContent}
      </>
    ),
  });
  return (
    <span
      ref={datumRef}
      {...attributes}
      {...(tooltipText ? hint.triggerProps : {})}
      onKeyDown={(event) => {
        hint.triggerProps.onKeyDown(event);
        if (!event.defaultPrevented) onKeyDown?.(event);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (tooltipText) hint.triggerProps.onFocus(event);
      }}
    >
      {children}
      {tooltipText && hint.tooltip}
    </span>
  );
}
