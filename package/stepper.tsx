import { h } from 'preact';
import type { ClassPreset } from './presets/types';
import { Button } from './controls';

/** A step in an ordered workflow. */
export interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export interface StepperProps {
  /** Accessible label for the workflow. */
  label: string;
  /** Steps in their displayed order. */
  steps: readonly WorkflowStep[];
  /** ID of the active step. */
  value: string;
  /** Called when an enabled step is activated. Omit for a read-only indicator. */
  onValueChange?: (id: string) => void;
  /** Localized status announced for completed steps. */
  completedLabel?: string;
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional root class names. */
  className?: string;
}
/** Ordered progress with optional direct navigation. */
export function Stepper({
  label,
  steps,
  value,
  onValueChange,
  completedLabel = 'Completed',
  preset,
  className = '',
}: StepperProps) {
  const current = steps.findIndex((step) => step.id === value);
  return (
    <nav
      class={`rv-stepper ${preset?.className ?? ''} ${className}`}
      data-part="root"
      aria-label={label}
      onKeyDown={(event) => {
        if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key))
          return;
        const buttons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            'button:not(:disabled)',
          ),
        );
        const index = buttons.indexOf(event.target as HTMLButtonElement);
        if (index < 0 || !buttons.length) return;
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const direction = (event.key === 'ArrowRight') !== rtl ? 1 : -1;
        const next =
          event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? buttons.length - 1
              : (index + direction + buttons.length) % buttons.length;
        event.preventDefault();
        buttons[next].focus();
      }}
    >
      <ol role="list">
        {steps.map((step, index) => (
          <li
            key={step.id}
            data-part="step"
            data-state={
              index === current
                ? 'current'
                : current >= 0 && index < current
                  ? 'complete'
                  : 'upcoming'
            }
          >
            {onValueChange ? (
              <Button
                variant="ghost"
                disabled={step.disabled}
                aria-current={index === current ? 'step' : undefined}
                onClick={() => onValueChange(step.id)}
              >
                <span class="rv-stepper-number" aria-hidden="true">
                  {current >= 0 && index < current ? '✓' : index + 1}
                </span>
                <span>
                  {step.label}
                  {current >= 0 && index < current && (
                    <span class="rv-stepper-status"> {completedLabel}</span>
                  )}
                  {step.description && <small>{step.description}</small>}
                </span>
              </Button>
            ) : (
              <span aria-current={index === current ? 'step' : undefined}>
                <span class="rv-stepper-number" aria-hidden="true">
                  {current >= 0 && index < current ? '✓' : index + 1}
                </span>
                <span>
                  {step.label}
                  {current >= 0 && index < current && (
                    <span class="rv-stepper-status"> {completedLabel}</span>
                  )}
                  {step.description && <small>{step.description}</small>}
                </span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
