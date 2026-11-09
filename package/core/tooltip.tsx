/** @jsxImportSource preact */
import { h, type ComponentChildren, type TargetedEvent } from 'preact';
import { useCallback, useLayoutEffect, useState } from 'preact/hooks';
import { createControlId } from './control-id';
import { TooltipSession } from './tooltip-session';

type TooltipPresentation = {
  className?: string;
  placement?: 'above';
  delay?: number;
  content?: ComponentChildren;
};

/** Preact adapter; the session owns all tooltip behavior and DOM lifecycle. */
export function useControlTooltip(
  text: string,
  _floating = true,
  presentation?: TooltipPresentation,
) {
  const [id] = useState(() => createControlId('rv-format-control-tooltip'));
  const [session] = useState(() => new TooltipSession());
  session.delay = presentation?.delay ?? 0;
  const hide = useCallback(() => session.hide(), [session]);
  const ref = useCallback(
    (element: HTMLSpanElement | null) => {
      if (!element) session.hide();
      session.setSurface(element);
    },
    [session],
  );
  useLayoutEffect(() => {
    session.hide();
  }, [text, presentation?.delay]);
  useLayoutEffect(() => () => session.destroy(), [session]);
  return {
    id,
    hide,
    triggerProps: {
      'aria-describedby': id,
      onFocus: (event: TargetedEvent<HTMLElement>) =>
        session.focus(event.currentTarget),
      onBlur: () => session.blur(),
      onMouseEnter: (event: TargetedEvent<HTMLElement>) =>
        session.show(event.currentTarget),
      onMouseLeave: (event?: TargetedEvent<HTMLElement>) =>
        session.leave(event?.currentTarget),
      onPointerDown: (_event: TargetedEvent<HTMLElement>) =>
        session.pointerDown(),
      onPointerCancel: () => session.hide(),
      onKeyDown: (event: KeyboardEvent) => session.keyDown(event),
    },
    tooltip: (
      <span
        ref={ref}
        id={id}
        class={`rv-tooltip ${presentation?.className ?? 'rv-format-control-tooltip'}`}
        role="tooltip"
        data-visible="false"
        hidden
      >
        {presentation?.content ?? text}
      </span>
    ),
  } as const;
}

/** Controlled surface adapter retained for existing consumers. */
export function ControlTooltip({
  id,
  text,
  content,
  visible,
  anchor = null,
  className = 'rv-format-control-tooltip',
}: {
  readonly id: string;
  readonly text: string;
  readonly content?: ComponentChildren;
  readonly visible: boolean;
  readonly anchor?: HTMLElement | null;
  readonly className?: string;
  readonly placement?: 'above';
}) {
  const [session] = useState(() => new TooltipSession());
  const ref = useCallback(
    (element: HTMLSpanElement | null) => {
      if (!element) session.hide();
      session.setSurface(element);
    },
    [session],
  );
  useLayoutEffect(() => {
    if (visible && anchor) session.show(anchor);
    else session.hide();
    return () => session.hide();
  }, [visible, anchor]);
  useLayoutEffect(() => () => session.destroy(), [session]);
  return (
    <span
      ref={ref}
      id={id}
      class={`rv-tooltip ${className}`}
      role="tooltip"
      data-visible={visible}
      hidden={!visible}
    >
      {content ?? text}
    </span>
  );
}

export const useTooltip = useControlTooltip;
