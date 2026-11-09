/** Includes portalled descendants linked by their owning trigger's aria-controls. */
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
    return [...surface.querySelectorAll<HTMLElement>('[aria-controls]')].some(
      (trigger) =>
        (trigger.getAttribute('aria-controls') ?? '')
          .split(/\s+/)
          .some((id) => {
            const popup = surface.ownerDocument.getElementById(id);
            return !!popup && owns(popup);
          }),
    );
  };
  return owns(root);
}
