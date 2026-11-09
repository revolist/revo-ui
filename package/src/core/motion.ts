/** Shared motion policy for CSS transitions, overlays and Web Animations. */
export type UiMotionTiming = 'fast' | 'normal' | 'enter' | 'exit';

function ancestors(element?: Element | null): Element[] {
  const result: Element[] = [];
  for (let current = element; current; ) {
    result.push(current);
    const root = current.getRootNode();
    current =
      current.parentElement ??
      (root.nodeType === 11 && 'host' in root
        ? (root as ShadowRoot).host
        : null);
  }
  return result;
}

export function isUiMotionEnabled(element?: Element | null): boolean {
  if (!element) return true;
  const view = element.ownerDocument.defaultView;
  if (view?.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    return false;
  if (
    ancestors(element).some(
      (node) => node.getAttribute('data-rv-ui-motion') === 'off',
    )
  )
    return false;
  return (
    view
      ?.getComputedStyle(element)
      .getPropertyValue('--rv-ui-motion-enabled')
      .trim() !== '0'
  );
}

export function getUiMotionDuration(
  element: Element,
  timing: UiMotionTiming,
  fallback: number,
): number {
  const value =
    element.ownerDocument.defaultView
      ?.getComputedStyle(element)
      .getPropertyValue(`--rv-ui-motion-${timing}`)
      .trim() ?? '';
  const match = value.match(/^((?:\d+(?:\.\d*)?|\.\d+))(ms|s)$/);
  return match ? Number(match[1]) * (match[2] === 's' ? 1000 : 1) : fallback;
}

/** Listeners exist only for an open portal or a currently running animation. */
export function watchUiMotionPolicy(
  element: Element,
  update: () => void,
): () => void {
  const view = element.ownerDocument.defaultView;
  const observer = view?.MutationObserver
    ? new view.MutationObserver(update)
    : undefined;
  for (const node of ancestors(element)) {
    observer?.observe(node, {
      attributes: true,
      attributeFilter: ['data-rv-ui-motion', 'style'],
    });
  }
  const media = view?.matchMedia?.('(prefers-reduced-motion: reduce)');
  media?.addEventListener?.('change', update);
  return () => {
    observer?.disconnect();
    media?.removeEventListener?.('change', update);
  };
}

/** Preserve opt-out policy when a surface leaves its original DOM subtree. */
export function inheritUiMotion(
  source: Element | null | undefined,
  target: Element,
): () => void {
  const original = target.getAttribute('data-rv-ui-motion');
  const restore = () => {
    if (original === null) target.removeAttribute('data-rv-ui-motion');
    else target.setAttribute('data-rv-ui-motion', original);
  };
  if (source === target || !source) return () => {};
  const update = () => {
    if (original === 'off' || !isUiMotionEnabled(source))
      target.setAttribute('data-rv-ui-motion', 'off');
    else restore();
  };
  update();
  const stop = watchUiMotionPolicy(source, update);
  return () => {
    stop();
    restore();
  };
}
