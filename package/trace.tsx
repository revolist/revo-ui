import { h, type ComponentChildren } from 'preact';
import type { ClassPreset } from './presets/types';
import { CollapsibleSection } from './field-configurator';
/** Host-owned run step and its optional details or child steps. */
export interface TraceStep {
  id: string;
  title: ComponentChildren;
  status: ComponentChildren;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  details?: ComponentChildren;
  children?: readonly TraceStep[];
}
export interface TraceProps {
  /** Accessible name for the trace. */ label: string;
  /** Steps in display order; status text is supplied and localized by the host. */ steps: readonly TraceStep[];
  /** Optional presentation preset. */ preset?: ClassPreset;
  /** Additional root class names. */ className?: string;
}
/** Run steps with readable status text and keyboard-accessible details. */
export function Trace({ label, steps, preset, className = '' }: TraceProps) {
  const renderSteps = (items: readonly TraceStep[]) => (
    <ol>
      {items.map((step) => (
        <li key={step.id} data-part="step" data-tone={step.tone ?? 'neutral'}>
          {step.details || step.children?.length ? (
            <CollapsibleSection
              title={
                <span class="rv-trace-title">
                  {step.title}
                  <span class="rv-trace-status">{step.status}</span>
                </span>
              }
            >
              {step.details}
              {step.children?.length ? renderSteps(step.children) : null}
            </CollapsibleSection>
          ) : (
            <div class="rv-trace-line">
              <span>{step.title}</span>
              <span class="rv-trace-status">{step.status}</span>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
  return (
    <section
      class={`rv-trace ${preset?.className ?? ''} ${className}`}
      aria-label={label}
      data-part="root"
    >
      {renderSteps(steps)}
    </section>
  );
}
