import { h } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  Button,
  Checkbox,
  Tooltip,
  createTooltipGroup,
} from '@revolist/ui/preact';
import { TooltipController } from '@revolist/ui/native';
import type { TooltipSide } from '@revolist/ui/native';
import { Example } from './catalog';

export function TooltipPlacementExamples() {
  const sides: TooltipSide[] = [
    'top',
    'bottom',
    'left',
    'right',
    'inline-start',
    'inline-end',
  ];
  return (
    <Example title="Tooltip placement, alignment and arrows">
      <div class="catalog-row">
        {sides.map((side) => (
          <Tooltip
            key={side}
            text={`${side}: placement flips and shifts to stay in view.`}
            side={side}
            sideOffset={12}
            arrow
          >
            <Button>{side}</Button>
          </Tooltip>
        ))}
      </div>
      <div class="catalog-row">
        {(['start', 'center', 'end'] as const).map((align) => (
          <Tooltip
            key={align}
            text={`Aligned to the ${align} of this trigger.`}
            align={align}
            side="bottom"
            arrow
          >
            <Button>{align} alignment</Button>
          </Tooltip>
        ))}
      </div>
      <p>
        Logical sides follow the trigger’s writing direction. Use the gallery’s
        Right to left setting to compare inline-start and inline-end. Viewport
        collision handling is enabled by default.
      </p>
    </Example>
  );
}
export function TooltipTimingExamples() {
  const [group] = useState(() =>
    createTooltipGroup({ delay: 600, closeDelay: 100, skipDelayDuration: 500 }),
  );
  return (
    <Example title="Shared tooltip delays">
      <div class="catalog-row">
        <Tooltip group={group} text="First hint after a short hover delay.">
          <Button>First grouped hint</Button>
        </Tooltip>
        <Tooltip
          group={group}
          text="Nearby hints open immediately while the group is warm."
        >
          <Button>Second grouped hint</Button>
        </Tooltip>
        <Tooltip
          text="Keyboard focus is immediate; hover waits one second."
          delay={1000}
        >
          <Button>One-second hover delay</Button>
        </Tooltip>
      </div>
      <p>
        Wait for the first grouped hint, then move to the second. The group
        shares timing across triggers; keyboard focus stays immediate unless
        focusDelay is supplied. Shared group objects also work across
        framework-owned roots.
      </p>
    </Example>
  );
}
export function TooltipStateExamples() {
  const [open, setOpen] = useState(false);
  const [clicks, setClicks] = useState(0);
  return (
    <Example title="Controlled, click and disabled tooltips">
      <div class="catalog-row">
        <Tooltip
          text="The application owns this open state."
          open={open}
          onOpenChange={setOpen}
          closeOnOutside={false}
          keepMounted
          transitionDuration={120}
          arrow
        >
          <Button>Controlled anchor</Button>
        </Tooltip>
        <Button onClick={() => setOpen(true)}>Show controlled hint</Button>
        <Button onClick={() => setOpen(false)}>Hide controlled hint</Button>
        <Tooltip
          text="Click again, press Escape, or click outside to dismiss."
          trigger="click"
          side="bottom"
        >
          <Button>Click-triggered hint</Button>
        </Tooltip>
        <Tooltip text="This tooltip is disabled." disabled>
          <Button onClick={() => setClicks((value) => value + 1)}>
            Disabled hint, working button
          </Button>
        </Tooltip>
      </div>
      <p role="status">
        Controlled hint: {open ? 'open' : 'closed'}. Working button clicks:{' '}
        {clicks}.
      </p>
      <p>
        onOpenChange reports requests with a reason, target and originating
        event. Controlled tooltips wait for the supplied open value. Disabling a
        tooltip does not disable its button.
      </p>
    </Example>
  );
}
export function TooltipContentExamples() {
  const [fail, setFail] = useState(false);
  const [result, setResult] = useState('No content loaded yet.');
  return (
    <Example title="Rich and asynchronous tooltip content">
      <div class="catalog-row">
        <Tooltip
          content={
            <>
              <strong>CSV export</strong>
              <span>Column names and visible values are included.</span>
            </>
          }
          width={240}
          side="bottom"
          arrow
        >
          <Button>Rich export hint</Button>
        </Tooltip>
        <Tooltip
          text="Report details"
          loadingContent="Loading report details…"
          errorContent="Report details are unavailable. Try again."
          loadContent={({ signal }) =>
            new Promise<string>((resolve, reject) => {
              const cancel = () => {
                clearTimeout(timer);
                reject(new DOMException('Canceled', 'AbortError'));
              };
              const timer = setTimeout(() => {
                signal.removeEventListener('abort', cancel);
                if (fail) reject(new Error('Demo load failure'));
                else resolve('Quarterly budget: ready for review.');
              }, 350);
              if (signal.aborted) cancel();
              else signal.addEventListener('abort', cancel, { once: true });
            })
          }
          onContentLoad={() => setResult('Report details loaded.')}
          onError={() => setResult('Report details could not be loaded.')}
        >
          <Button>Load report details</Button>
        </Tooltip>
        <Checkbox
          label="Simulate load failure"
          checked={fail}
          onChange={setFail}
        />
      </div>
      <p role="status">{result}</p>
      <p>
        The sample loads local demo text. Real data loading belongs to your
        application: use the supplied AbortSignal with fetch, provide translated
        loading/error copy, and keep credentials and URLs in your own data
        layer. Strings render as text, not injected HTML.
      </p>
      <p>
        Use descriptive rich content here. Links, forms, embedded frames and
        other focusable workflows belong in a Popover or Dialog.
      </p>
    </Example>
  );
}
export function TooltipBoundaryExample() {
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null);
  return (
    <Example title="Tooltip collision boundaries and sizing">
      <div
        ref={setBoundary}
        style={{
          border: '1px solid var(--rv-ui-border)',
          borderRadius: 8,
          padding: 24,
          width: 320,
          maxWidth: '100%',
          minHeight: 140,
        }}
      >
        <Tooltip
          text="This popup flips and shifts within the outlined area."
          side="left"
          collisionBoundary={boundary ?? undefined}
          collisionPadding={12}
          width={240}
          arrow
        >
          <Button>Hint near a boundary</Button>
        </Tooltip>
      </div>
      <p>
        collisionBoundary accepts an element or a rectangle. sideOffset and
        alignOffset accept numbers or dimension-aware functions. Width and
        height accept CSS values; oversized content is constrained and can
        scroll.
      </p>
    </Example>
  );
}
export function TooltipControllerExample() {
  const root = useRef<HTMLDivElement>(null);
  const tooltip = useRef<TooltipController>();
  const [count, setCount] = useState(2);
  useLayoutEffect(() => {
    const controller = (tooltip.current = new TooltipController());
    controller.bind(root.current!, '', {
      filter: '[data-tooltip-help]',
      renderContent: ({ target }) => target.getAttribute('data-tooltip-help'),
      closeOnOutside: false,
      autoHide: false,
      arrow: true,
    });
    return () => {
      controller.destroy();
      tooltip.current = undefined;
    };
  }, []);
  return (
    <Example title="Delegated and imperative tooltips">
      <div ref={root} class="catalog-row">
        {Array.from({ length: count }, (_, index) => (
          <Button
            key={index}
            data-tooltip-help={`Details for item ${index + 1}`}
          >
            Help item {index + 1}
          </Button>
        ))}
      </div>
      <div class="catalog-row">
        <Button onClick={() => setCount((value) => value + 1)}>
          Add help item
        </Button>
        <Button
          onClick={() =>
            tooltip.current?.show(
              root.current?.querySelector<HTMLButtonElement>('button') ??
                undefined,
            )
          }
        >
          Show first hint
        </Button>
        <Button onClick={() => tooltip.current?.hide()}>Hide hint</Button>
        <Button onClick={() => tooltip.current?.toggle()}>Toggle hint</Button>
        <Button onClick={() => tooltip.current?.refresh()}>Refresh hint</Button>
      </div>
      <p>
        One delegated binding covers dynamically added triggers. The controller
        also exposes isOpen, element, target(), setContent(), update() and
        destroy(). This example opts out of pointer-exit and outside-click
        dismissal so the imperative controls can be explored; Escape still
        dismisses it.
      </p>
    </Example>
  );
}

export function TooltipApiGuide() {
  return (
    <Example title="Tooltip API and accessibility guidance">
      <p>
        Tooltips share one lifecycle across every framework adapter. Use the API
        reference for exact types and the full guide for defaults, methods and
        recipes.
      </p>
      <ul>
        <li>
          Position: six physical/logical sides, start/center/end alignment,
          dimension-aware offsets, flip/shift, custom collision boundaries,
          arrows and sizing.
        </li>
        <li>
          State: controlled open or defaultOpen, disabled hints, cancellable
          changes, reason/target/event details and transition completion
          callbacks.
        </li>
        <li>
          Timing: independent hover/focus/close delays and shared warm-up
          groups; hover, focus, click, manual or combined triggers.
        </li>
        <li>
          Content: text, framework-owned rich content, per-target render
          callbacks and abortable asynchronous text with loading/error states.
        </li>
        <li>
          Lifecycle: external anchors, delegated dynamic triggers, portals,
          keepMounted, imperative methods and explicit destruction.
        </li>
      </ul>
      <p>
        Use a focusable trigger with an accessible name. Keep essential
        information visible. Escape dismisses the hint; hover descriptions
        remain readable across the trigger-to-popup gap. Interactive links,
        forms and embedded documents belong in a Popover or Dialog.
      </p>
      <p>
        <a href="https://github.com/revolist/revo-ui/blob/main/docs/tooltip.md">
          Read the complete tooltip guide
        </a>
      </p>
    </Example>
  );
}
