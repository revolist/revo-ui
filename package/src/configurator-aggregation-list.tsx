/** @jsxImportSource preact */
import { ButtonControl as UiButton } from './native-control';

import { h } from 'preact';
import { useSelectionListTooltips } from './core/selection-list-tooltips';
import { useState } from 'preact/hooks';
import checkIcon from '@fortawesome/fontawesome-free/svgs/solid/check.svg?raw';
import calculatorIcon from '@fortawesome/fontawesome-free/svgs/solid/calculator.svg?raw';
export interface AggregationListLabels {
  measureAggregation: string;
  aggregationNames: Record<string, string>;
  measureCurrentUnavailable: (operation: string) => string;
}

/** Arrow keys explore choices; Enter/Space commit through the existing configuration owner. */
export function ConfiguratorAggregationList({
  value,
  aggregators,
  i18n,
  disabled,
  onChange,
}: {
  value: string;
  aggregators: string[];
  i18n: AggregationListLabels;
  disabled?: boolean;
  onChange: (value: string, origin: HTMLButtonElement) => void;
}) {
  const tooltipRef = useSelectionListTooltips('[role="menuitemradio"]');
  const choices = aggregators.includes(value)
    ? aggregators
    : [value, ...aggregators];
  const [focused, setFocused] = useState<string>();
  const tabStop =
    focused && aggregators.includes(focused)
      ? focused
      : aggregators.includes(value)
        ? value
        : aggregators[0];
  return (
    <section className="pivot-aggregation-menu">
      <div className="pivot-aggregation-heading">{i18n.measureAggregation}</div>
      <div ref={tooltipRef} role="menu" aria-label={i18n.measureAggregation}>
        {choices.map((operation) => (
          <UiButton
            key={operation}
            type="button"
            role="menuitemradio"
            className="rv-btn pivot-aggregation-option"
            data-value={operation}
            aria-checked={operation === value}
            disabled={disabled || !aggregators.includes(operation)}
            tabIndex={!disabled && operation === tabStop ? 0 : -1}
            onFocus={() => setFocused(operation)}
            onKeyDown={(event) => {
              if (
                ![
                  'ArrowUp',
                  'ArrowDown',
                  'ArrowLeft',
                  'ArrowRight',
                  'Home',
                  'End',
                ].includes(event.key)
              )
                return;
              event.preventDefault();
              event.stopPropagation();
              const buttons = [
                ...event.currentTarget.parentElement!.querySelectorAll<HTMLButtonElement>(
                  'button:not(:disabled)',
                ),
              ];
              const index = buttons.indexOf(event.currentTarget);
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? buttons.length - 1
                    : (index +
                        (event.key === 'ArrowUp' || event.key === 'ArrowLeft'
                          ? -1
                          : 1) +
                        buttons.length) %
                      buttons.length;
              buttons[next]?.focus();
            }}
            onClick={(event) => onChange(operation, event.currentTarget)}
          >
            <span
              className="pivot-field-action-symbol"
              aria-hidden="true"
              dangerouslySetInnerHTML={{ __html: calculatorIcon }}
            />
            <span className="pivot-aggregation-name">
              {aggregators.includes(operation)
                ? (i18n.aggregationNames[operation] ?? operation)
                : i18n.measureCurrentUnavailable(operation)}
            </span>
            {operation === value && (
              <span
                className="pivot-aggregation-check"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: checkIcon }}
              />
            )}
          </UiButton>
        ))}
      </div>
    </section>
  );
}
