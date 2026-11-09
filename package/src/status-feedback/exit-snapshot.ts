import { isUiMotionEnabled } from '../core/motion';
import { showTopLayerPopup } from '../core/top-layer-popup';
import { animateStatusFeedback } from './motion';

/** A short-lived inert snapshot allows exit motion after the renderer removes its node. */
export function statusFeedbackExit(
  panel: HTMLElement,
): (() => void) | undefined {
  const view = panel.ownerDocument.defaultView;
  if (!view || typeof panel.animate !== 'function' || !isUiMotionEnabled(panel))
    return;
  const rect = panel.getBoundingClientRect();
  const snapshot = panel.cloneNode(true) as HTMLElement;
  const originals = [panel, ...panel.querySelectorAll<HTMLElement>('*')];
  const copies = [snapshot, ...snapshot.querySelectorAll<HTMLElement>('*')];
  snapshot.removeAttribute('popover');
  snapshot.removeAttribute('id');
  snapshot
    .querySelectorAll('[id]')
    .forEach((node) => node.removeAttribute('id'));
  snapshot.querySelectorAll('[role], [aria-live]').forEach((node) => {
    node.removeAttribute('role');
    node.removeAttribute('aria-live');
  });
  snapshot.setAttribute('aria-hidden', 'true');
  snapshot.inert = true;
  snapshot.dataset.statusFeedbackExit = '';
  const style = view.getComputedStyle(panel);
  // The snapshot leaves its theme ancestor. Carry the same resolved presentation.
  for (const property of Array.from(style))
    if (property.startsWith('--rv-'))
      snapshot.style.setProperty(property, style.getPropertyValue(property));
  Object.assign(snapshot.style, {
    position: 'fixed',
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    display: 'flex',
    pointerEvents: 'none',
    color: style.color,
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    fontFamily: style.fontFamily,
    boxShadow: style.boxShadow,
  });
  panel.ownerDocument.body.append(snapshot);
  // A manual popover keeps the exit above the board without intercepting interaction.
  showTopLayerPopup(snapshot);
  originals.forEach((element, index) => {
    if (element.scrollTop) copies[index].scrollTop = element.scrollTop;
    if (element.scrollLeft) copies[index].scrollLeft = element.scrollLeft;
  });
  const cleanup = () => {
    snapshot.remove();
  };
  const animation = animateStatusFeedback(
    snapshot,
    [{ opacity: 1 }, { opacity: 0 }],
    'rv-status-exit',
    140,
  );
  if (!animation) {
    cleanup();
    return;
  }
  animation.onfinish = cleanup;
  animation.oncancel = cleanup;
  return () => {
    animation.cancel();
    cleanup();
  };
}
