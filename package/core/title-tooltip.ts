import { useLayoutEffect, useRef } from 'preact/hooks';
import { TooltipController } from './popover-controller';

/** Native title replacement, without wrappers or changes to consumer handlers. */
export function useTitleTooltip<T extends HTMLElement | SVGElement>(
  title?: string,
  onEscape?: () => void,
) {
  const anchor = useRef<T>(null);
  const escape = useRef(onEscape);
  escape.current = onEscape;
  useLayoutEffect(() => {
    if (!anchor.current || !title) return;
    const tooltip = new TooltipController();
    return tooltip.bind(anchor.current, title, {
      onEscape: () => escape.current?.(),
    });
  }, [title]);
  return anchor;
}
