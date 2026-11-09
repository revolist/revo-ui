import { useLayoutEffect, useRef } from 'preact/hooks';

const noRelease = () => {};

function canReturnFocus(
  origin: HTMLElement,
  root: HTMLElement | null,
): root is HTMLElement {
  if (
    !origin.isConnected ||
    !root?.isConnected ||
    origin.ownerDocument !== root.ownerDocument
  )
    return false;
  const active = origin.ownerDocument.activeElement;
  return (
    !active ||
    active === origin.ownerDocument.body ||
    active === origin ||
    root.contains(active)
  );
}

/** Return focus only from this editor. Release a temporary tab stop on blur or disposal. */
export function focusConfiguratorOrigin(
  origin: HTMLElement,
  root: HTMLElement | null,
): () => void {
  if (!canReturnFocus(origin, root)) return noRelease;
  const document = origin.ownerDocument;
  const active = document.activeElement;
  origin.focus({ preventScroll: true });
  if (
    document.activeElement === origin ||
    origin.hasAttribute('tabindex') ||
    !origin.isConnected ||
    !root.isConnected
  )
    return noRelease;
  if (
    document.activeElement !== active &&
    document.activeElement !== document.body
  )
    return noRelease;
  let live = true;
  const release = () => {
    if (!live) return;
    live = false;
    origin.removeEventListener('blur', release);
    if (origin.getAttribute('tabindex') === '-1')
      origin.removeAttribute('tabindex');
  };
  origin.setAttribute('tabindex', '-1');
  origin.addEventListener('blur', release);
  try {
    origin.focus({ preventScroll: true });
    if (
      document.activeElement !== origin ||
      !origin.isConnected ||
      !root.isConnected
    )
      release();
  } catch (error) {
    release();
    throw error;
  }
  return release;
}

/** A single mounted owner's lease; synchronous focus callbacks cannot revive a disposed lease. */
export function useConfiguratorOriginFocus() {
  const release = useRef(noRelease);
  const serial = useRef(0);
  const mounted = useRef(true);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      serial.current++;
      const cleanup = release.current;
      release.current = noRelease;
      cleanup();
    };
  }, []);
  return (origin: HTMLElement, root: HTMLElement | null) => {
    if (!mounted.current || !canReturnFocus(origin, root)) return;
    const generation = ++serial.current;
    const previous = release.current;
    release.current = noRelease;
    previous();
    if (!mounted.current || generation !== serial.current) return;
    const cleanup = focusConfiguratorOrigin(origin, root);
    if (!mounted.current || generation !== serial.current) cleanup();
    else release.current = cleanup;
  };
}
