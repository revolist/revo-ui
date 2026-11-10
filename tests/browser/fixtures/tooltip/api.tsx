/** @jsxImportSource preact */
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  Tooltip,
  ControlTooltip,
  createTooltipGroup,
  useTooltip,
} from '@revolist/ui/preact';
import { TooltipController } from '@revolist/ui/native';

export function TooltipApiFixture() {
  const [open, setOpen] = useState(false);
  const [surfaceDisabled, setSurfaceDisabled] = useState(true);
  const [surfaceAnchor, setSurfaceAnchor] = useState<HTMLButtonElement | null>(
    null,
  );
  const [loads, setLoads] = useState(0);
  const [fail, setFail] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [group] = useState(() =>
    createTooltipGroup({ delay: 200, skipDelayDuration: 500 }),
  );
  const [count, setCount] = useState(1);
  const root = useRef<HTMLDivElement>(null);
  const hook = useTooltip('Hook click details', true, {
    trigger: 'click',
    delay: 60000,
    group,
  });
  const manual = useTooltip('Untouched manual details', true, {
    trigger: 'manual',
  });
  useLayoutEffect(() => {
    const controller = new TooltipController();
    controller.bind(root.current!, '', {
      filter: '[data-help]',
      trigger: 'click',
      side: 'bottom',
      arrow: true,
      renderContent: ({ target }) => (
        <strong>{target.getAttribute('data-help')}</strong>
      ),
    });
    return () => controller.destroy();
  }, []);
  return (
    <main style={{ padding: 100, display: 'grid', gap: 30 }}>
      <Tooltip
        side="right"
        align="start"
        sideOffset={16}
        arrow
        collisionAvoidance={false}
        content={<strong>Rich placement details</strong>}
      >
        <button>Positioned help</button>
      </Tooltip>
      <Tooltip trigger="click" text="Click details" delay={60000} group={group}>
        <button onClick={() => setClicks((value) => value + 1)}>
          Click help
        </button>
      </Tooltip>
      <button
        onClick={() => setClicks((value) => value + 1)}
        {...hook.triggerProps}
      >
        Hook help
      </button>
      {hook.tooltip}
      <button {...manual.triggerProps}>Untouched manual help</button>
      {manual.tooltip}
      <button onClick={() => manual.show()}>Show manual hint</button>
      <button ref={setSurfaceAnchor}>Controlled surface anchor</button>
      <ControlTooltip
        id="api-control-surface"
        text="Controlled surface details"
        visible
        anchor={surfaceAnchor}
        disabled={surfaceDisabled}
      />
      <button onClick={() => setSurfaceDisabled((value) => !value)}>
        Toggle surface disabled
      </button>
      <output aria-label="Clicks">{clicks}</output>
      <Tooltip
        text="Controlled details"
        open={open}
        onOpenChange={setOpen}
        transitionDuration={50}
        keepMounted
      >
        <button>Controlled help</button>
      </Tooltip>
      <output aria-label="Open">{String(open)}</output>
      <Tooltip group={group} text="First group details">
        <button>First grouped help</button>
      </Tooltip>
      <Tooltip group={group} text="Second group details">
        <button>Second grouped help</button>
      </Tooltip>
      <Tooltip
        text="Base details"
        loadingContent="Loading details"
        errorContent="Details unavailable"
        loadContent={async ({ signal }) => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          if (fail) throw new Error('Offline');
          return 'Loaded details';
        }}
        onContentLoad={() => setLoads((value) => value + 1)}
        onError={() => setLoads((value) => value + 1)}
      >
        <button>Async help</button>
      </Tooltip>
      <output aria-label="Loads">{loads}</output>
      <button onClick={() => setFail((value) => !value)}>Toggle failure</button>
      <div ref={root}>
        {Array.from({ length: count }, (_, index) => (
          <button data-help={`Item ${index + 1} details`}>
            Delegated {index + 1}
          </button>
        ))}
      </div>
      <button onClick={() => setCount((value) => value + 1)}>
        Add delegated trigger
      </button>
    </main>
  );
}
