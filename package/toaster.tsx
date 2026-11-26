import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import checkIcon from '@fortawesome/fontawesome-free/svgs/regular/circle-check.svg?raw';
import infoIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-info.svg?raw';
import warningIcon from '@fortawesome/fontawesome-free/svgs/solid/circle-exclamation.svg?raw';
import { RemoveButton } from './buttons/remove-button';
import { Button, Spinner } from './controls';
import { SvgIcon } from './icons/icon';
import type { ClassPreset } from './presets/types';
import type { ToastController, ToastEntry } from './toast-store';
import { renderPreactInto } from './preact-mount';
import { registerComponentStyles } from './core/component-styles';
import { feedbackStyles } from './component-style-families';

export * from './toast-store';

type ToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

export interface ToasterProps {
  /** Notification controller created with createToaster. Mount one viewport per controller. */
  toaster: ToastController;
  /** Logical viewport corner or edge. Use inline to render within a layout. */
  position?: ToastPosition | 'inline';
  /** Maximum visible notifications. Older entries wait in the queue. */
  visibleCount?: number;
  /** Accessible names supplied by the host's localization system. */
  text?: { notifications?: string; dismiss?: string };
  preset?: ClassPreset;
  className?: string;
}

/** Mount a toaster into a native application-owned host. */
export function mountToaster(host: HTMLElement, props: ToasterProps) {
  const StyledToaster = registerComponentStyles(Toaster, feedbackStyles);
  renderPreactInto(host, <StyledToaster {...props} />);
  return { destroy: () => renderPreactInto(host, null) };
}

const icons = {
  info: infoIcon,
  success: checkIcon,
  warning: warningIcon,
  error: warningIcon,
};

function ToastCard({
  entry,
  paused,
  dismiss,
  dismissLabel,
}: {
  entry: ToastEntry;
  paused: boolean;
  dismiss: (id: number) => void;
  dismissLabel: string;
}) {
  const tone = entry.tone ?? 'neutral';
  const duration =
    entry.duration ?? (tone === 'loading' ? 0 : 4000);
  const timer = useRef({ entry, remaining: duration });
  const icon =
    tone === 'neutral' || tone === 'loading' ? undefined : icons[tone];
  const { id } = entry;
  const dismissRef = useRef(dismiss);
  dismissRef.current = dismiss;

  useEffect(() => {
    if (timer.current.entry !== entry)
      timer.current = { entry, remaining: duration };
    if (paused || !Number.isFinite(duration) || duration <= 0) return;

    const current = timer.current;
    const startedAt = performance.now();
    const timeout = setTimeout(() => dismissRef.current(id), current.remaining);
    return () => {
      clearTimeout(timeout);
      current.remaining = Math.max(
        0,
        current.remaining - (performance.now() - startedAt),
      );
    };
  }, [duration, entry, id, paused]);

  return (
    <li
      class="rv-toast"
      data-part="toast"
      data-tone={tone}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        dismiss(id);
      }}
    >
      <div class="rv-toast__body">
        {tone === 'loading' && (
          <div class="rv-toast__icon" data-part="icon" aria-hidden="true">
            <Spinner label={entry.title} />
          </div>
        )}
        {icon && (
          <span class="rv-toast__icon" data-part="icon">
            <SvgIcon svg={icon} size={16} />
          </span>
        )}
        <div class="rv-toast__copy">
          <div data-part="title">{entry.title}</div>
          {entry.description && (
            <div data-part="description">{entry.description}</div>
          )}
        </div>
      </div>
      {entry.action && (
        <div data-part="action">
          <Button
            type="button"
            size="compact"
            onClick={() => {
              dismiss(id);
              entry.action?.onClick();
            }}
          >
            {entry.action.label}
          </Button>
        </div>
      )}
      <div class="rv-toast__dismiss" data-part="dismiss">
        <RemoveButton
          compact
          locale={{ title: dismissLabel, ariaLabel: dismissLabel }}
          onClick={() => dismiss(id)}
        />
      </div>
    </li>
  );
}

/** Themed notification viewport with screen-reader announcements and paused timers during interaction. */
export function Toaster({
  toaster,
  position = 'bottom-end',
  visibleCount = 3,
  text,
  preset,
  className,
}: ToasterProps) {
  const [entries, setEntries] = useState(toaster.getSnapshot);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const count = Number.isFinite(visibleCount)
    ? Math.max(1, Math.floor(visibleCount))
    : 3;
  const visible = entries.slice(-count).reverse();
  const label = text?.notifications ?? 'Notifications';

  useEffect(() => toaster.subscribe(setEntries), [toaster]);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const cards = [...list.querySelectorAll<HTMLElement>('.rv-toast')];
      cards.forEach((card, index) => {
        card.style.setProperty(
          '--rv-toast-overlap',
          `${cards[index - 1]?.offsetHeight ?? 0}px`,
        );
      });
    };
    update();
    const observer =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(update);
    list
      .querySelectorAll('.rv-toast')
      .forEach((card) => observer?.observe(card));
    return () => observer?.disconnect();
  }, [entries, count]);
  useEffect(() => {
    if (entries.length) return;
    setHovered(false);
    setFocused(false);
  }, [entries.length]);
  useEffect(() => {
    const owner = root.current?.ownerDocument;
    if (!owner) return;
    const update = () => setHidden(owner.hidden);
    update();
    owner.addEventListener('visibilitychange', update);
    return () => owner.removeEventListener('visibilitychange', update);
  }, []);

  return (
    <section
      ref={root}
      class={['rv-toaster', preset?.className, className]
        .filter(Boolean)
        .join(' ')}
      data-part="root"
      data-position={position}
      data-empty={visible.length === 0 || undefined}
      aria-label={label}
    >
      <div
        class="rv-toast-announcements"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {visible.map((entry) => (
          <div key={entry.id}>
            {[entry.title, entry.description].filter(Boolean).join('. ')}
          </div>
        ))}
      </div>
      {visible.length > 0 && (
        <ul
          ref={listRef}
          class="rv-toaster__list"
          data-part="list"
          data-expanded={hovered || focused || undefined}
          role="list"
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          onPointerDown={(event) => {
            if (event.pointerType === 'touch') setHovered(true);
          }}
          onFocusIn={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              returnFocus.current = event.relatedTarget as HTMLElement | null;
              setFocused(true);
            }
          }}
          onFocusOut={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setFocused(false);
          }}
        >
          {visible.map((entry) => (
            <ToastCard
              key={entry.id}
              entry={entry}
              paused={hovered || focused || hidden}
              dismissLabel={text?.dismiss ?? 'Dismiss notification'}
              dismiss={(id) => {
                const buttons =
                  root.current?.querySelectorAll<HTMLButtonElement>(
                    '.rv-toast__dismiss button',
                  );
                const index = visible.findIndex(
                  (candidate) => candidate.id === id,
                );
                if (buttons?.[index]?.closest('li')?.matches(':focus-within')) {
                  (
                    buttons[index + 1] ??
                    buttons[index - 1] ??
                    returnFocus.current
                  )?.focus();
                }
                toaster.dismiss(id);
              }}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
