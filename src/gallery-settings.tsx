import { h, type ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { SvgIcon } from '@revolist/ui/icons/icon';
import ellipsis from '@fortawesome/fontawesome-free/svgs/solid/ellipsis.svg?raw';

export function GallerySettings({ children }: { children: ComponentChildren }) {
  const [compact, setCompact] = useState(
    () => window.matchMedia('(max-width: 1200px)').matches,
  );
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1200px)');
    const resize = () => {
      setCompact(media.matches);
      setOpen(false);
    };
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);
  useEffect(() => {
    if (!compact || !open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        root.current?.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [compact, open]);
  return (
    <details
      class="gallery-settings"
      ref={root}
      open={!compact || open}
      onToggle={(event) => {
        if (compact) setOpen(event.currentTarget.open);
      }}
    >
      <summary
        role="button"
        aria-label="More gallery options"
        aria-expanded={compact ? open : undefined}
      >
        <SvgIcon svg={ellipsis} size={18} />
      </summary>
      <div class="gallery-settings-content">{children}</div>
    </details>
  );
}
