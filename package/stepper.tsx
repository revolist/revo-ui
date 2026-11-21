import { h, type ComponentChildren } from 'preact';
import { useId, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { ClassPreset } from './presets/types';
import { Button } from './controls';
import { SvgIcon, chevronDownIcon } from './icons';

export interface WorkflowStep {
  /** Unique identifier in the workflow. */
  id: string;
  /** Visible title and accessible name of the step. */
  label: string;
  /** Optional supporting text below the title. */
  description?: string;
  /** Decorative replacement for the default number. */
  icon?: ComponentChildren;
  /** Optional step panel, kept mounted while hidden. */
  content?: ComponentChildren;
  /** Whether navigation should skip this step. */
  disabled?: boolean;
}

export interface StepperChangeDetails {
  /** Zero-based active index. The step count denotes completion. */
  step: number;
}

export interface StepperInvalidDetails extends StepperChangeDetails {
  /** Navigation blocked by validation. */
  action: 'next' | 'set';
  /** Requested index. */
  targetStep: number;
}

export interface StepperProps {
  /** Accessible label for the workflow. */
  label: string;
  /** Steps in display order. The list determines the step count. */
  steps: readonly WorkflowStep[];
  /** Controlled ID of the active step. Without a callback, renders read-only indicators. */
  value?: string;
  /** Called when an enabled step is selected by ID. */
  onValueChange?: (id: string) => void;
  /** Controlled zero-based index. Use the step count to indicate completion. */
  step?: number;
  /** Initial zero-based index for uncontrolled use. */
  defaultStep?: number;
  /** Called with the new zero-based index, including completion. */
  onStepChange?: (details: StepperChangeDetails) => void;
  /** Explicit horizontal or vertical layout. Auto stacks at narrow widths. */
  orientation?: 'auto' | 'horizontal' | 'vertical';
  /** Show one inline disclosure panel at a time in a vertical list. */
  layout?: 'standard' | 'accordion';
  /** Override the inherited text direction. */
  dir?: 'ltr' | 'rtl';
  /** Optional DOM identifier for the stepper. */
  id?: string;
  /** Override root, list, trigger or panel DOM IDs. */
  ids?: {
    root?: string;
    list?: string;
    triggerId?: (index: number) => string;
    contentId?: (index: number) => string;
  };
  /** Require Back and Next navigation instead of direct step activation. */
  linear?: boolean;
  /** Prevent navigation while work is in progress. */
  busy?: boolean;
  /** Localized accessible busy text for the current step. */
  busyLabel?: string;
  /** Optional steps may be bypassed when navigating with Back and Next. */
  isStepSkippable?: (index: number) => boolean;
  /** Check the active step before moving forward. */
  isStepValid?: (index: number) => boolean;
  /** Called when validation blocks a forward action. */
  onStepInvalid?: (details: StepperInvalidDetails) => void;
  /** Called when the workflow reaches the completion state. */
  onStepComplete?: () => void;
  /** Completion panel displayed after the final step. */
  completedContent?: ComponentChildren;
  /** Localized status announced for completed steps. */
  completedLabel?: string;
  /** Localized label for the optional Back button. */
  previousLabel?: string;
  /** Localized label for the optional Next button. */
  nextLabel?: string;
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional root class names. */
  className?: string;
}

export function Stepper({
  label,
  steps,
  value,
  onValueChange,
  step,
  defaultStep = 0,
  onStepChange,
  orientation = 'auto',
  layout = 'standard',
  dir,
  id,
  ids,
  linear,
  busy,
  busyLabel = 'Loading',
  isStepSkippable,
  isStepValid,
  onStepInvalid,
  onStepComplete,
  completedContent,
  previousLabel,
  nextLabel,
  completedLabel = 'Completed',
  preset,
  className = '',
}: StepperProps) {
  const generatedId = useId();
  const rootId = ids?.root ?? id ?? generatedId;
  const [localStep, setLocalStep] = useState(defaultStep);
  const [focusStep, setFocusStep] = useState<string>();
  const [inspected, setInspected] = useState<{
    active: string | undefined;
    id: string | null;
  }>();
  const root = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<number | undefined>(undefined);
  const accordion = layout === 'accordion';
  const current =
    value !== undefined
      ? steps.findIndex((item) => item.id === value)
      : Math.max(0, Math.min(steps.length, Math.trunc(step ?? localStep)));
  const controlled = value !== undefined || step !== undefined;
  const interactive = !controlled || !!(onValueChange || onStepChange);
  const completed = current === steps.length && steps.length > 0;

  const activeId = steps[current]?.id;
  const openId =
    inspected && inspected.active === activeId ? inspected.id : activeId;

  useLayoutEffect(() => {
    if (pendingFocus.current !== current) return;
    pendingFocus.current = undefined;
    const target = completed
      ? root.current?.querySelector<HTMLElement>(
          ':scope > [data-part="body"] > [data-part="completed"]',
        )
      : root.current?.querySelector<HTMLElement>(
          ':scope > nav > ol > [data-state="current"] > :is(button, span[tabindex])',
        );
    const headers = root.current?.querySelectorAll<HTMLElement>(
      ':scope > nav > ol > li > button:not(:disabled)',
    );
    (
      target ?? (headers?.length ? headers[headers.length - 1] : undefined)
    )?.focus();
  }, [current, completed]);

  function adjacent(direction: -1 | 1) {
    for (
      let index = current + direction;
      index >= 0 && index < steps.length;
      index += direction
    ) {
      if (!steps[index].disabled && !isStepSkippable?.(index)) return index;
    }
    return direction > 0 ? steps.length : -1;
  }

  function activate(target: number, action: 'next' | 'set') {
    if (
      !interactive ||
      busy ||
      target === current ||
      target < 0 ||
      target > steps.length ||
      steps[target]?.disabled
    )
      return;
    if (
      target > current &&
      current >= 0 &&
      current < steps.length &&
      !isStepSkippable?.(current) &&
      isStepValid?.(current) === false
    ) {
      onStepInvalid?.({ step: current, action, targetStep: target });
      return;
    }
    if (accordion) {
      setInspected(undefined);
      pendingFocus.current = target;
    }
    if (!controlled) setLocalStep(target);
    const selected = steps[target];
    if (selected) onValueChange?.(selected.id);
    onStepChange?.({ step: target });
    if (target === steps.length) onStepComplete?.();
  }

  const triggerId = (index: number) =>
    ids?.triggerId?.(index) ?? `${rootId}-step-${index}`;
  const panelId = (index: number) =>
    ids?.contentId?.(index) ?? `${rootId}-panel-${index}`;
  const focusable = steps.filter((item) => !item.disabled);
  const defaultFocus =
    steps[current] && !steps[current].disabled
      ? steps[current].id
      : completed
        ? focusable.at(-1)?.id
        : focusable[0]?.id;
  const tabbable = focusable.some((item) => item.id === focusStep)
    ? focusStep
    : defaultFocus;
  const hasPanels =
    completedContent != null || steps.some((item) => item.content != null);
  const hasControls = previousLabel != null || nextLabel != null;

  const actions = hasControls && (
    <div class="rv-stepper-actions" data-part="actions">
      {previousLabel != null && (
        <Button
          disabled={!interactive || busy || adjacent(-1) < 0}
          onClick={() => activate(adjacent(-1), 'set')}
        >
          {previousLabel}
        </Button>
      )}
      {nextLabel != null && (
        <Button
          variant="primary"
          disabled={!interactive || busy || completed || !steps.length}
          onClick={() => activate(adjacent(1), 'next')}
        >
          {nextLabel}
        </Button>
      )}
    </div>
  );
  const actionsInline =
    accordion && openId === activeId && steps[current]?.content != null;

  function renderPanel(item: WorkflowStep, index: number, hidden: boolean) {
    if (item.content == null) return null;
    return (
      <section
        key={item.id}
        data-part="panel"
        id={panelId(index)}
        aria-labelledby={triggerId(index)}
        hidden={hidden}
        inert={accordion && hidden ? true : undefined}
      >
        {accordion ? (
          <div class="rv-stepper-panel-content">
            {item.content}
            {!hidden && index === current && actions}
          </div>
        ) : (
          item.content
        )}
      </section>
    );
  }

  return (
    <div
      ref={root}
      class={`rv-stepper ${preset?.className ?? ''} ${className}`}
      id={rootId}
      dir={dir}
      data-part="root"
      data-orientation={accordion ? 'vertical' : orientation}
      data-layout={
        accordion
          ? 'accordion'
          : hasPanels || hasControls
            ? 'workflow'
            : undefined
      }
      aria-busy={busy || undefined}
    >
      <nav aria-label={label} data-part="navigation">
        <ol
          role="list"
          id={ids?.list}
          data-part="list"
          class="rv-stepper-list"
          onFocusOut={(event) => {
            const related = event.relatedTarget;
            if (
              !(related instanceof Node) ||
              !event.currentTarget.contains(related)
            )
              setFocusStep(undefined);
          }}
          onKeyDown={(event) => {
            const style = getComputedStyle(event.currentTarget);
            const vertical = style.flexDirection === 'column';
            const nextKey = vertical
              ? 'ArrowDown'
              : style.direction === 'rtl'
                ? 'ArrowLeft'
                : 'ArrowRight';
            const previousKey = vertical
              ? 'ArrowUp'
              : style.direction === 'rtl'
                ? 'ArrowRight'
                : 'ArrowLeft';
            const key = event.key;
            if (
              key !== nextKey &&
              key !== previousKey &&
              key !== 'Home' &&
              key !== 'End'
            )
              return;
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                ':scope > li > button:not(:disabled)',
              ),
            );
            const index = buttons.indexOf(event.target as HTMLButtonElement);
            if (index < 0) return;
            const next =
              key === 'Home'
                ? 0
                : key === 'End'
                  ? buttons.length - 1
                  : (index + (key === nextKey ? 1 : -1) + buttons.length) %
                    buttons.length;
            event.preventDefault();
            buttons[next].focus();
          }}
        >
          {steps.map((item, index) => {
            const state =
              index === current
                ? 'current'
                : index < current
                  ? 'complete'
                  : 'upcoming';
            const currentStep = state === 'current' ? 'step' : undefined;
            const marker =
              state === 'complete' ? '✓' : (item.icon ?? index + 1);
            const expandable = accordion && item.content != null;
            const expanded = expandable && item.id === openId;
            const contents = (
              <>
                <span
                  class="rv-stepper-number"
                  data-part="indicator"
                  aria-hidden="true"
                >
                  {marker}
                </span>
                <span>
                  <span data-part="title">{item.label}</span>
                  {state === 'complete' && (
                    <span class="rv-stepper-status"> {completedLabel}</span>
                  )}
                  {busy && state === 'current' && (
                    <span class="rv-stepper-status"> {busyLabel}</span>
                  )}
                  {item.description && (
                    <small data-part="description">{item.description}</small>
                  )}
                </span>
                {expandable && (
                  <SvgIcon
                    svg={chevronDownIcon}
                    size={12}
                    className="rv-svg-icon rv-stepper-chevron"
                  />
                )}
              </>
            );
            return (
              <li key={item.id} data-part="step" data-state={state}>
                {(accordion ? expandable : interactive && !linear) ? (
                  <Button
                    variant="ghost"
                    id={triggerId(index)}
                    disabled={item.disabled || (!accordion && busy)}
                    aria-current={currentStep}
                    aria-controls={
                      item.content != null ? panelId(index) : undefined
                    }
                    aria-expanded={expandable ? expanded : undefined}
                    tabIndex={accordion || tabbable === item.id ? 0 : -1}
                    onFocus={() => setFocusStep(item.id)}
                    onClick={() => {
                      if (expandable)
                        setInspected({
                          active: activeId,
                          id: expanded ? null : item.id,
                        });
                      else activate(index, 'set');
                    }}
                  >
                    {contents}
                  </Button>
                ) : (
                  <span
                    id={triggerId(index)}
                    aria-current={currentStep}
                    tabIndex={accordion && currentStep ? -1 : undefined}
                  >
                    {contents}
                  </span>
                )}
                {accordion && renderPanel(item, index, !expanded)}
              </li>
            );
          })}
        </ol>
      </nav>
      {(!accordion
        ? hasPanels || hasControls
        : completed || (hasControls && !actionsInline)) && (
        <div class="rv-stepper-body" data-part="body">
          {!accordion &&
            steps.map((item, index) =>
              renderPanel(item, index, index !== current),
            )}
          {completedContent != null && (
            <div
              data-part="completed"
              hidden={!completed}
              tabIndex={accordion ? -1 : undefined}
            >
              {completedContent}
            </div>
          )}
          {!actionsInline && actions}
        </div>
      )}
    </div>
  );
}
