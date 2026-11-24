/** Includes semantic popups and auxiliary controls sharing their portalled surface. */
export function ownsPopupTarget(
  root: HTMLElement | null | undefined,
  target: Node | null,
): boolean {
  if (!root || !target) return false;
  const visited = new Set<HTMLElement>();
  const owns = (surface: HTMLElement): boolean => {
    if (visited.has(surface)) return false;
    visited.add(surface);
    if (surface.contains(target)) return true;
    return [
      ...(surface.matches('[aria-controls], [data-rv-popup-controls]') ? [surface] : []),
      ...surface.querySelectorAll<HTMLElement>(
        '[aria-controls], [data-rv-popup-controls]',
      ),
    ].some((trigger) =>
      [
        trigger.getAttribute('aria-controls'),
        trigger.getAttribute('data-rv-popup-controls'),
      ]
        .filter(Boolean)
        .join(' ')
        .split(/\s+/)
        .some((id) => {
          const root = trigger.getRootNode();
          const popup =
            ('getElementById' in root
              ? (root as Document | ShadowRoot).getElementById(id)
              : null) ?? surface.ownerDocument.getElementById(id);
          return !!popup && owns(popup);
        }),
    );
  };
  return owns(root);
}
