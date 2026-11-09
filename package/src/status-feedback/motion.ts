import {
  getUiMotionDuration,
  isUiMotionEnabled,
  watchUiMotionPolicy,
} from '../core/motion';

/** Overlay-only motion; request state and renderer ownership stay with the consumer. */
export function animateStatusFeedback(
  panel: HTMLElement,
  frames: Keyframe[],
  id: string,
  duration = 180,
): Animation | undefined {
  if (typeof panel.animate !== 'function' || !isUiMotionEnabled(panel)) return;
  const timing = id.includes('exit')
    ? 'exit'
    : id.includes('resize')
      ? 'normal'
      : 'enter';
  const effectiveDuration = getUiMotionDuration(panel, timing, duration);
  if (effectiveDuration <= 0) return;
  const animation = panel.animate(frames, {
    duration: effectiveDuration,
    easing:
      panel.ownerDocument.defaultView
        ?.getComputedStyle(panel)
        .getPropertyValue('--rv-ui-motion-ease')
        .trim() || 'cubic-bezier(.2, 0, 0, 1)',
  });
  animation.id = id;
  // Interrupting enter/resize/exit motion rejects this promise with AbortError.
  // The event handlers still own cleanup; cancellation is an expected outcome.
  const stop = watchUiMotionPolicy(panel, () => {
    if (!isUiMotionEnabled(panel)) animation.cancel();
  });
  void animation.finished.then(stop, stop);
  return animation;
}
