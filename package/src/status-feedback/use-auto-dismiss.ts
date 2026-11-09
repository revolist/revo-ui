import { useEffect, useRef, useState } from 'preact/hooks';
import type { StatusFeedbackItem } from './types';

/** Timers follow individual items; the consumer remains the owner of removal. */
export function useAutoDismiss(
  items: readonly StatusFeedbackItem[],
  duration = 0,
  onDismiss?: (id: string) => void,
) {
  const [exiting, setExiting] = useState<ReadonlySet<string>>(new Set());
  const callback = useRef(onDismiss);
  callback.current = onDismiss;
  const timers = useRef(
    new Map<
      string,
      {
        item: StatusFeedbackItem;
        duration: number;
        timer: ReturnType<typeof setTimeout>;
      }
    >(),
  );
  useEffect(() => {
    for (const [id, entry] of timers.current) {
      if (
        !onDismiss ||
        duration <= 0 ||
        !items.includes(entry.item) ||
        entry.duration !== duration
      ) {
        clearTimeout(entry.timer);
        timers.current.delete(id);
        setExiting(
          (current) => new Set([...current].filter((value) => value !== id)),
        );
      }
    }
    if (!onDismiss || duration <= 0) return;
    for (const item of items) {
      if (
        item.busy ||
        item.tone === 'warning' ||
        item.tone === 'danger' ||
        timers.current.has(item.id)
      )
        continue;
      const entry = {
        item,
        duration,
        timer: setTimeout(() => {
          setExiting((current) => new Set([...current, item.id]));
          entry.timer = setTimeout(() => callback.current?.(item.id), 160);
        }, duration),
      };
      timers.current.set(item.id, entry);
    }
  }, [items, duration, !!onDismiss]);
  useEffect(
    () => () => {
      for (const entry of timers.current.values()) clearTimeout(entry.timer);
      timers.current.clear();
    },
    [],
  );
  return items.map((item) =>
    exiting.has(item.id)
      ? { ...item, data: { ...item.data, 'data-exiting': 'true' } }
      : item,
  );
}
