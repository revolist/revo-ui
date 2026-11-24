/** Add one description ID and remove only the token owned by this binding. */
export function bindAriaDescription(anchor: Element, id: string): () => void {
  if (!id || /\s/.test(id)) return () => {};
  const tokens = (anchor.getAttribute('aria-describedby') ?? '')
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.includes(id)) return () => {};
  anchor.setAttribute('aria-describedby', [...tokens, id].join(' '));
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    const remaining = (anchor.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter((token) => token && token !== id);
    if (remaining.length)
      anchor.setAttribute('aria-describedby', remaining.join(' '));
    else anchor.removeAttribute('aria-describedby');
  };
}
