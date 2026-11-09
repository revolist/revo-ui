import type { RefObject } from 'preact';
import { useEffect } from 'preact/hooks';
import { attachDialogDrag } from './dialog.drag';

export interface UseDialogDragOptions<
  Target extends HTMLElement,
  Handle extends HTMLElement,
> {
  readonly targetRef: RefObject<Target>;
  readonly handleRef: RefObject<Handle>;
  readonly enabled?: boolean;
}

/**
 * Connects Preact-rendered dialog refs to the framework-neutral drag owner.
 */
export function useDialogDrag<
  Target extends HTMLElement,
  Handle extends HTMLElement,
>({
  targetRef,
  handleRef,
  enabled = true,
}: UseDialogDragOptions<Target, Handle>): void {
  useEffect(() => {
    const target = targetRef.current;
    const handle = handleRef.current;
    if (!enabled || !target || !handle) {
      return;
    }
    return attachDialogDrag({ target, handle });
  }, [enabled, handleRef, targetRef]);
}
