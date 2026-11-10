/** @jsxImportSource preact */
import { h, type ComponentChildren, type TargetedEvent } from 'preact';
import { useCallback, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { createControlId } from './control-id';
import { TooltipSession } from './tooltip-session';
import type { TooltipAnchor, TooltipOptions } from './tooltip-options';

export interface TooltipPresentation extends TooltipOptions {
  content?: ComponentChildren;
  defaultOpen?: boolean;
  anchor?: TooltipAnchor | null;
}
/** Spread triggerProps onto your own focusable trigger and render tooltip once. */
export function useControlTooltip(
  text: string,
  _floating = true,
  presentation?: TooltipPresentation,
) {
  const [generatedId] = useState(() =>
    createControlId('rv-format-control-tooltip'),
  );
  const id = presentation?.id ?? generatedId;
  const [session] = useState(() => new TooltipSession());
  const anchor = useRef<TooltipAnchor | null>(null);
  const initial = useRef(false);
  const hide = useCallback(() => session.hide(), [session]);
  const ref = useCallback(
    (element: HTMLSpanElement | null) => {
      if (!element) session.hide('destroy', undefined, true);
      session.setSurface(element);
    },
    [session],
  );
  useLayoutEffect(() => {
    session.hide();
  }, [text, presentation?.delay]);
  useLayoutEffect(() => {
    session.configure(presentation ?? {});
    if (presentation?.anchor) anchor.current = presentation.anchor;
    if (!anchor.current && (presentation?.open || presentation?.defaultOpen)) {
      anchor.current =
        [
          ...(session.element?.ownerDocument.querySelectorAll<HTMLElement>(
            '[aria-describedby]',
          ) ?? []),
        ].find((element) =>
          element.getAttribute('aria-describedby')?.split(/\s+/).includes(id),
        ) ?? null;
    }
    if (presentation?.open !== undefined) {
      if (presentation.open && anchor.current)
        session.show(anchor.current, 'controlled');
      else session.hide('controlled');
    } else if (!initial.current) {
      initial.current = true;
      if (presentation?.defaultOpen && anchor.current)
        session.show(anchor.current, 'controlled');
    }
  });
  useLayoutEffect(() => () => session.destroy(), [session]);
  const triggers = Array.isArray(presentation?.trigger)
    ? presentation.trigger
    : presentation?.trigger === 'manual'
      ? []
      : presentation?.trigger === 'click'
        ? ['click']
        : presentation?.trigger === 'focus'
          ? ['focus']
          : ['hover', 'focus'];
  return {
    id,
    hide,
    show: () => {
      if (anchor.current) session.show(anchor.current);
    },
    refresh: () => session.refresh(),
    triggerProps: {
      'aria-describedby': id,
      onFocus: (event: TargetedEvent<HTMLElement>) => {
        anchor.current = event.currentTarget;
        if (triggers.includes('focus'))
          session.focus(event.currentTarget, event);
      },
      onBlur: (event?: TargetedEvent<HTMLElement>) => session.blur(event),
      onMouseEnter: (event: TargetedEvent<HTMLElement>) => {
        anchor.current = event.currentTarget;
        if (triggers.includes('hover'))
          session.show(event.currentTarget, 'hover', event);
      },
      onMouseLeave: (event?: TargetedEvent<HTMLElement>) =>
        session.leave(event?.currentTarget, event as MouseEvent | undefined),
      onPointerDown: (_event?: TargetedEvent<HTMLElement>) =>
        session.pointerDown(),
      onPointerCancel: () => session.hide(),
      // Capture composes with the host's ordinary onClick handler.
      onClickCapture: (event: TargetedEvent<HTMLElement>) => {
        anchor.current = event.currentTarget;
        if (triggers.includes('click')) {
          if (session.isOpen) session.hide('click', event);
          else session.show(event.currentTarget, 'click', event);
        } else if (presentation?.hideOnClick !== false)
          session.hide('press', event);
      },
      onKeyDown: (event: KeyboardEvent) => {
        if (!triggers.includes('click') || event.key === 'Escape')
          session.keyDown(event);
      },
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
        <span class="rv-tooltip__content">{presentation?.content ?? text}</span>
      </span>
    ),
  } as const;
}
export interface ControlTooltipProps extends TooltipOptions {
  id: string;
  text: string;
  content?: ComponentChildren;
  visible: boolean;
  anchor?: TooltipAnchor | null;
}
/** A controlled presentation surface; the host owns trigger markup and focus. */
export function ControlTooltip({
  id,
  text,
  content,
  visible,
  anchor = null,
  className = 'rv-format-control-tooltip',
  ...options
}: ControlTooltipProps) {
  const [session] = useState(() => new TooltipSession());
  const ref = useCallback(
    (element: HTMLSpanElement | null) => {
      if (!element) session.hide('destroy', undefined, true);
      session.setSurface(element);
    },
    [session],
  );
  useLayoutEffect(() => {
    session.configure({ ...options, className });
  });
  useLayoutEffect(() => {
    if (visible && anchor) session.show(anchor, 'controlled');
    else session.hide('controlled');
    return () => session.hide('destroy', undefined, true);
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
      <span class="rv-tooltip__content">{content ?? text}</span>
    </span>
  );
}
export const useTooltip = useControlTooltip;
