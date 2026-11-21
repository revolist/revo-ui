import { Fragment, h } from 'preact';
import { useRef } from 'preact/hooks';
import previousIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-left.svg?raw';
import nextIcon from '@fortawesome/fontawesome-free/svgs/solid/chevron-right.svg?raw';
import { Badge, Button, IconButton, ToolbarGroup } from './controls';
import { SingleValueSlider } from './filter/filters/slider/single';
import type { ClassPreset } from './presets/types';
import {
  HistoryEntryAuthor,
  HistoryRestore,
  useHistorySelection,
  type HistoryEntry,
  type HistoryRestoreLabels,
} from './history/history-parts';

export interface BackupSnapshot extends HistoryEntry {
  /** Display-ready snapshot kind, such as Full or Incremental. */
  kind?: string;
  /** Draw a taller date tick for a full backup or other milestone. */
  majorTick?: boolean;
  /** Display-ready size. */
  size?: string;
  /** Display-ready size delta or supporting detail. */
  change?: string;
  /** Display-ready duration. */
  duration?: string;
  /** Display-ready verification state. */
  status?: string;
  /** Disable restore for unavailable snapshots. */
  restoreDisabled?: boolean;
}

export interface BackupHistoryLabels {
  empty: string;
  scrubber: string;
  previous: string;
  next: string;
  preview: string;
  /** Optional caption for the date. */
  taken?: string;
  /** Optional caption for the duration. */
  duration?: string;
  restore: HistoryRestoreLabels;
  /** Localized position text for the live region and slider value. */
  position: (index: number, total: number, snapshot: BackupSnapshot) => string;
}

export interface BackupHistoryProps {
  /** Accessible title for the history region. */
  label: string;
  /** Snapshots ordered from oldest to newest. */
  snapshots: readonly BackupSnapshot[];
  /** Controlled snapshot ID. Initially selects the newest snapshot when omitted. */
  value?: string;
  /** Reports a selected snapshot ID. */
  onValueChange?: (id: string) => void;
  /** Requests a non-destructive preview of the selected snapshot. */
  onPreview?: (id: string) => void;
  /** Requests a restore after confirmation. */
  onRestore?: (id: string) => void;
  /** Localized navigation, preview and restore strings. */
  labels: BackupHistoryLabels;
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional root classes. */
  className?: string;
}

/** Scrub and inspect backup snapshots using one shared selection. */
export function BackupHistory({
  label,
  snapshots,
  value,
  onValueChange,
  onPreview,
  onRestore,
  labels,
  preset,
  className = '',
}: BackupHistoryProps) {
  const { selected, select } = useHistorySelection(
    snapshots,
    value,
    snapshots.at(-1),
    onValueChange,
  );
  const start = useRef<{ x: number; y: number }>();
  const index = selected ? snapshots.indexOf(selected) : 0;
  const move = (next: number) => {
    const snapshot = snapshots[next];
    if (snapshot) select(snapshot.id);
  };
  const description = selected
    ? labels.position(index + 1, snapshots.length, selected)
    : labels.empty;

  const status = (
    <p class="rv-history-summary" data-part="status" role="status">
      {description}
    </p>
  );

  return (
    <section
      aria-label={label}
      class={`rv-backup-history ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      {selected ? (
        <>
          <div
            class="rv-backup-track"
            data-part="track"
            aria-label={labels.scrubber}
            role="group"
            tabIndex={0}
            onKeyDown={(event) => {
              const { key } = event;
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key))
                return;
              event.preventDefault();
              move(
                key === 'Home'
                  ? 0
                  : key === 'End'
                    ? snapshots.length - 1
                    : index + (key === 'ArrowRight' ? 1 : -1),
              );
            }}
            onPointerDown={(event) => {
              if (event.pointerType === 'touch')
                start.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerCancel={() => {
              start.current = undefined;
            }}
            onPointerUp={(event) => {
              const origin = start.current;
              start.current = undefined;
              if (!origin) return;
              const x = event.clientX - origin.x;
              if (
                Math.abs(x) > 36 &&
                Math.abs(x) > Math.abs(event.clientY - origin.y)
              )
                move(index + (x < 0 ? 1 : -1));
            }}
          >
            <div
              class="rv-backup-rail"
              data-part="rail"
              style={{ '--rv-backup-index': index }}
            >
              {snapshots.map((snapshot) => (
                <article
                  key={snapshot.id}
                  class="rv-backup-card"
                  data-part="snapshot"
                  aria-hidden={snapshot !== selected || undefined}
                  inert={snapshot !== selected || undefined}
                >
                  <header class="rv-backup-card-header">
                    <div class="rv-history-entry-title">
                      <span class="rv-backup-title">{snapshot.title}</span>
                      {snapshot.kind && (
                        <Badge variant="neutral" shape="rounded">
                          {snapshot.kind}
                        </Badge>
                      )}
                    </div>
                    {snapshot.status && (
                      <Badge variant="neutral" shape="rounded">
                        {snapshot.status}
                      </Badge>
                    )}
                  </header>
                  <div class="rv-backup-metrics">
                    {snapshot.size && (
                      <span class="rv-backup-size">{snapshot.size}</span>
                    )}
                    {snapshot.change && (
                      <span class="rv-history-summary">{snapshot.change}</span>
                    )}
                  </div>
                  <div class="rv-backup-meta">
                    <div>
                      {labels.taken && (
                        <span class="rv-history-summary">{labels.taken}</span>
                      )}
                      <time dateTime={snapshot.dateTime}>
                        {snapshot.dateLabel}
                      </time>
                    </div>
                    {snapshot.duration && (
                      <div>
                        {labels.duration && (
                          <span class="rv-history-summary">
                            {labels.duration}
                          </span>
                        )}
                        <span>{snapshot.duration}</span>
                      </div>
                    )}
                    <HistoryEntryAuthor entry={snapshot} />
                  </div>
                </article>
              ))}
            </div>
          </div>
          {snapshots.length > 1 && (
            <div class="rv-backup-scrubber" data-part="scrubber" dir="ltr">
              <SingleValueSlider
                min={0}
                max={snapshots.length - 1}
                step={1}
                value={index}
                onChange={move}
                ariaLabel={labels.scrubber}
                ariaValueText={description}
              />
              <div class="rv-backup-dates" aria-hidden="true">
                {(snapshots.length <= 12
                  ? snapshots
                  : [snapshots[0], snapshots[snapshots.length - 1]]
                ).map((snapshot) => (
                  <span
                    key={snapshot.id}
                    class="rv-backup-tick"
                    data-major={snapshot.majorTick || undefined}
                    data-current={snapshot === selected || undefined}
                  >
                    <span>{snapshot.dateLabel}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div class="rv-backup-footer" data-part="actions">
            {status}
            <ToolbarGroup className="rv-backup-navigation">
              {onPreview && (
                <Button onClick={() => onPreview(selected.id)}>
                  {labels.preview}
                </Button>
              )}
              {onRestore && (
                <HistoryRestore
                  entry={selected}
                  enabled={!selected.restoreDisabled}
                  entries={snapshots.filter((entry) => !entry.restoreDisabled)}
                  labels={labels.restore}
                  onRestore={onRestore}
                />
              )}
            </ToolbarGroup>
            {snapshots.length > 1 && (
              <ToolbarGroup className="rv-backup-navigation">
                <IconButton
                  label={labels.previous}
                  icon={previousIcon}
                  disabled={index === 0}
                  onClick={() => move(index - 1)}
                />
                <IconButton
                  label={labels.next}
                  icon={nextIcon}
                  disabled={index === snapshots.length - 1}
                  onClick={() => move(index + 1)}
                />
              </ToolbarGroup>
            )}
          </div>
        </>
      ) : (
        status
      )}
    </section>
  );
}
