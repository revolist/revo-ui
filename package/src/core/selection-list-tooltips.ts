import { useCallback, useRef } from 'preact/hooks';
import { releasePreactElement } from '../preact-mount';
import { createTooltipElement } from './popover-controller';
import { TooltipSession } from './tooltip-session';

/** One delegated binding per list, including options rendered by custom templates. */
export function useSelectionListTooltips(optionSelector = '[role="option"]') {
  const cleanup = useRef<(() => void) | undefined>(undefined);
  return useCallback(
    (root: HTMLElement | null) => {
      cleanup.current?.();
      cleanup.current = undefined;
      if (!root) return;
      const session = new TooltipSession();
      const surface = createTooltipElement(root.ownerDocument, 'rv-tooltip');
      session.setSurface(surface);
      let active: HTMLElement | undefined;
      const optionFor = (target: EventTarget | null) => {
        const element = target as HTMLElement | null;
        const option = element?.closest?.<HTMLElement>(optionSelector);
        return option && root.contains(option) ? option : undefined;
      };
      const hide = () => {
        active = undefined;
        session.hide();
      };
      const reveal = (option?: HTMLElement) => {
        if (!option) {
          hide();
          return;
        }
        // Layout reads are limited to the interacted option, never the whole list.
        const clipped = [
          option,
          ...option.querySelectorAll<HTMLElement>('*'),
        ].filter(
          (element) =>
            element.textContent?.trim() &&
            element.scrollWidth > element.clientWidth,
        );
        const labels = clipped.filter(
          (element) =>
            !clipped.some(
              (child) => child !== element && element.contains(child),
            ),
        );
        const text = labels
          .map((element) => element.textContent!.trim())
          .join('\n');
        if (!text) {
          hide();
          return;
        }
        if (active === option && surface.textContent === text && session.isOpen)
          return;
        hide();
        active = option;
        surface.textContent = text;
        session.show(option);
      };
      const enter = (event: Event) => reveal(optionFor(event.target));
      const leave = (event: Event) => {
        if (optionFor((event as MouseEvent).relatedTarget) !== active) hide();
      };
      const keyup = (event: KeyboardEvent) => {
        if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
          return;
        // Composite pickers keep focus in a search input beside the list.
        const navigationOwner = root.hasAttribute('aria-activedescendant')
          ? root
          : root.querySelector('[aria-activedescendant]');
        const id = navigationOwner?.getAttribute('aria-activedescendant');
        if (id) reveal(optionFor(root.ownerDocument.getElementById(id)));
      };
      root.addEventListener('pointerover', enter, true);
      root.addEventListener('pointerout', leave, true);
      root.addEventListener('focusin', enter, true);
      root.addEventListener('focusout', leave, true);
      root.addEventListener('pointerdown', hide, true);
      root.addEventListener('keyup', keyup);
      cleanup.current = () => {
        session.destroy();
        releasePreactElement(surface);
        root.removeEventListener('pointerover', enter, true);
        root.removeEventListener('pointerout', leave, true);
        root.removeEventListener('focusin', enter, true);
        root.removeEventListener('focusout', leave, true);
        root.removeEventListener('pointerdown', hide, true);
        root.removeEventListener('keyup', keyup);
      };
    },
    [optionSelector],
  );
}
