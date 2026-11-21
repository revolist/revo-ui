import { h, type ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import type { ClassPreset } from './presets/types';
import { RemoveButton } from './buttons/remove-button';
import { SvgIcon } from './icons/icon';
import fileIcon from '@fortawesome/fontawesome-free/svgs/solid/file-lines.svg?raw';
/** File state and text are supplied by the application; no upload is performed. */
export interface AttachmentItem {
  id: string;
  name: string;
  description?: string;
  state?: string;
  /** Decorative preview; describe meaningful information in name or description. */
  preview?: ComponentChildren;
  disabled?: boolean;
}
export interface AttachmentsProps {
  /** Accessible label for the file list. */ label: string;
  /** Files in display order. */ items: readonly AttachmentItem[];
  /** Called when a file is removed; omit for a read-only list. */ onRemove?: (
    id: string,
  ) => void;
  /** Localized remove action label for a file. */ removeLabel: (
    item: AttachmentItem,
  ) => string;
  /** Optional presentation preset. */ preset?: ClassPreset;
  /** Additional root class names. */ className?: string;
}
/** File chips for host-owned uploads and attachments. */
export function Attachments({
  label,
  items,
  onRemove,
  removeLabel,
  preset,
  className = '',
}: AttachmentsProps) {
  const list = useRef<HTMLUListElement>(null);
  const pendingRemoval = useRef<{ id: string; index: number } | null>(null);
  useLayoutEffect(() => {
    const pending = pendingRemoval.current;
    if (!pending || items.some((item) => item.id === pending.id)) return;
    pendingRemoval.current = null;
    // Do not steal focus if the user has moved on while an async removal ran.
    if (document.activeElement !== document.body) return;
    const buttons = list.current?.querySelectorAll<HTMLButtonElement>(
      'button:not(:disabled)',
    );
    (
      buttons?.[Math.min(pending.index, buttons.length - 1)] ?? list.current
    )?.focus();
  }, [items]);
  return (
    <ul
      ref={list}
      role="list"
      tabIndex={-1}
      class={`rv-attachments ${preset?.className ?? ''} ${className}`}
      data-part="root"
      aria-label={label}
    >
      {items.map((item, index) => (
        <li key={item.id} data-part="item">
          <span class="rv-attachment-preview" aria-hidden="true">
            {item.preview ?? <SvgIcon svg={fileIcon} size={16} />}
          </span>
          <span class="rv-attachment-copy">
            <span>{item.name}</span>
            {item.description && <small>{item.description}</small>}
            {item.state && <small>{item.state}</small>}
          </span>
          {onRemove && (
            <RemoveButton
              onClick={(event) => {
                pendingRemoval.current =
                  document.activeElement === event.currentTarget
                    ? { id: item.id, index }
                    : null;
                onRemove(item.id);
              }}
              disabled={item.disabled}
              locale={{
                title: removeLabel(item),
                ariaLabel: removeLabel(item),
              }}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
