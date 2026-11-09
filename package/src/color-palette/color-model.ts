export function normalizeHexColor(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(normalized);
  if (short)
    return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
  return /^#[\da-f]{6}$/i.test(normalized) ? normalized : undefined;
}

/** Same keyboard order for native and Preact palette adapters. */
export function handleColorPaletteKeyDown(event: KeyboardEvent) {
  if (
    ![
      'ArrowRight',
      'ArrowDown',
      'ArrowLeft',
      'ArrowUp',
      'Home',
      'End',
    ].includes(event.key)
  )
    return;
  const current = event.target as HTMLElement;
  const group = current.closest<HTMLElement>('.rv-color-palette');
  const buttons = Array.from(
    group?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [],
  );
  if (!buttons.length) return;
  const currentIndex = Math.max(
    0,
    buttons.indexOf(current as HTMLButtonElement),
  );
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? buttons.length - 1
        : (currentIndex +
            (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) +
            buttons.length) %
          buttons.length;
  event.preventDefault();
  buttons[next]?.focus();
}
