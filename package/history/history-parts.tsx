import { h } from 'preact';
import { useState } from 'preact/hooks';
import { AvatarElement, getAvatarInitials } from '../avatar';
import { Badge, Button } from '../controls';
import { ConfirmDialog } from '../pickers';

export interface HistoryEntry {
  /** Stable identifier supplied by the host. */
  id: string;
  /** Localized entry title. */
  title: string;
  /** Display-ready timestamp. */
  dateLabel: string;
  /** Machine-readable timestamp, when available. */
  dateTime?: string;
  /** Optional author or source. */
  author?: string;
  /** Optional author photo. The avatar falls back to initials. */
  authorAvatarUrl?: string;
}

export interface HistoryRestoreLabels {
  restore: string;
  title: string;
  confirm: string;
  cancel: string;
  close: string;
}

export function HistoryEntryAuthor({ entry }: { entry: HistoryEntry }) {
  return entry.author ? (
    <span class="rv-history-author" data-part="author">
      <AvatarElement
        key={entry.authorAvatarUrl}
        options={{
          label: '',
          size: 20,
          value: entry.authorAvatarUrl,
          initials: getAvatarInitials(entry.author),
        }}
      />
      <span>{entry.author}</span>
    </span>
  ) : null;
}

export function HistoryEntryLabel({
  entry,
  badge,
  authorFirst = false,
}: {
  entry: HistoryEntry;
  badge?: string;
  authorFirst?: boolean;
}) {
  const author = <HistoryEntryAuthor entry={entry} />;
  return (
    <span class="rv-history-entry-label">
      <span class="rv-history-entry-title">
        <strong>{entry.title}</strong>
        {badge && (
          <Badge variant="accent" shape="rounded">
            {badge}
          </Badge>
        )}
      </span>
      <span class="rv-history-entry-meta">
        {authorFirst && author}
        <time dateTime={entry.dateTime}>{entry.dateLabel}</time>
        {!authorFirst && author}
      </span>
    </span>
  );
}

export function useHistorySelection<T extends HistoryEntry>(
  entries: readonly T[],
  value: string | undefined,
  fallback: T | undefined,
  onValueChange: ((id: string) => void) | undefined,
) {
  const [localId, setLocalId] = useState<string>();
  const selected =
    entries.find((entry) => entry.id === (value ?? localId)) ?? fallback;
  return {
    selected,
    select: (id: string) => {
      if (id === selected?.id || !entries.some((entry) => entry.id === id))
        return;
      if (value === undefined) setLocalId(id);
      onValueChange?.(id);
    },
  };
}

export function HistoryRestore({
  entry,
  enabled,
  active = true,
  entries,
  labels,
  onRestore,
}: {
  entry?: HistoryEntry;
  enabled: boolean;
  active?: boolean;
  entries: readonly HistoryEntry[];
  labels: HistoryRestoreLabels;
  onRestore: (id: string) => void;
}) {
  const [pendingId, setPendingId] = useState<string>();
  const pending = entries.find((candidate) => candidate.id === pendingId);
  const close = () => setPendingId(undefined);
  return (
    <>
      <Button
        variant="primary"
        disabled={!enabled || !entry}
        onClick={() => setPendingId(entry?.id)}
      >
        {labels.restore}
      </Button>
      <ConfirmDialog
        open={active && !!pending}
        title={labels.title}
        closeLabel={labels.close}
        cancelLabel={labels.cancel}
        confirmLabel={labels.confirm}
        onClose={close}
        onConfirm={() => {
          if (!pending) return;
          close();
          onRestore(pending.id);
        }}
      >
        {pending && <HistoryEntryLabel entry={pending} />}
      </ConfirmDialog>
    </>
  );
}
