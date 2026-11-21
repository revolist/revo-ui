import { Fragment, h } from 'preact';
import { useMemo, useRef, useState } from 'preact/hooks';
import { RadioGroup } from './controls';
import { Dialog } from './pickers';
import { SegmentedSwitch } from './segmented-switch';
import type { ClassPreset } from './presets/types';
import { compareHistoryCells, type HistoryCell } from './history/cell-changes';
import {
  HistoryEntryLabel,
  HistoryRestore,
  useHistorySelection,
  type HistoryEntry,
  type HistoryRestoreLabels,
} from './history/history-parts';

export { compareHistoryCells } from './history/cell-changes';
export type { HistoryCell, HistoryCellChange } from './history/cell-changes';
export type {
  HistoryEntry,
  HistoryRestoreLabels,
} from './history/history-parts';

export interface HistoryVersion extends HistoryEntry {
  /** Snapshot cells. Omitted IDs are treated as empty. */
  cells: readonly HistoryCell[];
  /** Prevent restoring this version. */
  restoreDisabled?: boolean;
}

export interface HistoryReviewLabels {
  versions: string;
  /** Visible and accessible label for the comparison switch. */
  comparison: string;
  /** Accessible changes table name. Defaults to the comparison label. */
  changesTable?: string;
  previous: string;
  current: string;
  currentVersion: string;
  address: string;
  before: string;
  after: string;
  emptyValue: string;
  noVersions: string;
  noPrevious: string;
  noChanges: string;
  close: string;
  restore: HistoryRestoreLabels;
  /** Localized comparison summary, including pluralization. */
  changeCount: (count: number) => string;
}

export interface HistoryReviewProps {
  /** Accessible title for the review. */
  label: string;
  /** Versions in newest-first order. */
  versions: readonly HistoryVersion[];
  /** Current version ID. Defaults to the first version. */
  currentId?: string;
  /** Controlled ID of the version being inspected. */
  value?: string;
  /** Reports a selected version ID. */
  onValueChange?: (id: string) => void;
  /** Omit for inline rendering or control modal visibility with a boolean. */
  open?: boolean;
  /** Reports that the modal should close. */
  onClose?: () => void;
  /** Runs after confirming a restore. The host persists the resulting version. */
  onRestore?: (id: string) => void;
  /** Localized review, comparison and restore strings. */
  labels: HistoryReviewLabels;
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional root classes. */
  className?: string;
}

export interface HistoryChangeRow {
  /** Stable identifier for the displayed change. */
  id: string;
  /** Localized cell address or operation label. */
  address: string;
  sheet?: string;
  /** Omit for rows that describe an operation without a cell comparison. */
  values?: {
    before: string | null;
    after: string | null;
  };
}

export interface HistoryChangesProps {
  label: string;
  rows: readonly HistoryChangeRow[];
  labels: Pick<
    HistoryReviewLabels,
    'address' | 'before' | 'after' | 'emptyValue'
  >;
}

/** Display before and after values for changes already resolved by the host. */
export function HistoryChanges({ label, rows, labels }: HistoryChangesProps) {
  return (
    <table class="rv-history-changes" aria-label={label}>
      <thead>
        <tr>
          <th scope="col">{labels.address}</th>
          <th scope="col">{labels.before}</th>
          <th scope="col">{labels.after}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ id, address, sheet, values }) => (
          <tr key={id}>
            <th scope="row">
              {sheet && <small>{sheet}</small>}
              <span>{address}</span>
            </th>
            {values ? (
              <>
                <td>
                  {values.before === null ? (
                    labels.emptyValue
                  ) : (
                    <del>{values.before}</del>
                  )}
                </td>
                <td>
                  {values.after === null ? (
                    labels.emptyValue
                  ) : (
                    <ins>{values.after}</ins>
                  )}
                </td>
              </>
            ) : (
              <td colSpan={2} />
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Browse saved versions and review spreadsheet changes by stable cell ID. */
export function HistoryReview({
  label,
  versions,
  currentId,
  value,
  onValueChange,
  open,
  onClose,
  onRestore,
  labels,
  preset,
  className = '',
}: HistoryReviewProps) {
  const review = useRef<HTMLElement>(null);
  const current =
    versions.find((entry) => entry.id === currentId) ?? versions[0];
  const { selected, select } = useHistorySelection(
    versions,
    value,
    current,
    onValueChange,
  );
  const [compareTo, setCompareTo] = useState<'previous' | 'current'>(
    'previous',
  );
  const baseline =
    compareTo === 'current'
      ? current
      : selected && versions[versions.indexOf(selected) + 1];
  const changes = useMemo(
    () =>
      selected && baseline && selected !== baseline
        ? compareHistoryCells(baseline.cells, selected.cells)
        : [],
    [selected, baseline],
  );

  const content = (
    <section
      ref={review}
      class={`rv-history-review ${preset?.className ?? ''} ${className}`}
      data-part="root"
      data-mode={open === undefined ? 'inline' : 'dialog'}
      aria-label={open === undefined ? label : undefined}
    >
      {selected ? (
        <>
          <div class="rv-history-sidebar" data-part="versions">
            <div
              class="rv-history-sidebar-heading"
              data-part="versions-label"
              aria-hidden="true"
            >
              {labels.versions}
            </div>
            <RadioGroup
              className="rv-history-versions"
              label={labels.versions}
              value={selected.id}
              onChange={select}
              options={versions.map((entry) => ({
                value: entry.id,
                label: (
                  <HistoryEntryLabel
                    entry={entry}
                    authorFirst
                    badge={
                      entry === current ? labels.currentVersion : undefined
                    }
                  />
                ),
              }))}
            />
          </div>
          <div class="rv-history-comparison" data-part="comparison">
            <div
              class="rv-history-comparison-control"
              data-part="comparison-control"
            >
              <span data-part="comparison-label">{labels.comparison}</span>
              <SegmentedSwitch<'previous' | 'current'>
                role="group"
                ariaLabel={labels.comparison}
                value={compareTo}
                onChange={setCompareTo}
                options={[
                  { value: 'previous', label: labels.previous },
                  { value: 'current', label: labels.current },
                ]}
              />
            </div>
            <div class="rv-history-summary" role="status">
              {!baseline
                ? labels.noPrevious
                : changes.length
                  ? labels.changeCount(changes.length)
                  : labels.noChanges}
            </div>
            {!!changes.length && (
              <HistoryChanges
                label={labels.changesTable ?? labels.comparison}
                rows={changes.map(
                  ({ cell: { id, address, sheet }, before, after }) => ({
                    id,
                    address,
                    sheet,
                    values: { before, after },
                  }),
                )}
                labels={labels}
              />
            )}
            {onRestore && (
              <div class="rv-history-actions">
                <HistoryRestore
                  entry={selected}
                  enabled={selected !== current && !selected.restoreDisabled}
                  active={open !== false}
                  entries={versions.filter(
                    (entry) => entry !== current && !entry.restoreDisabled,
                  )}
                  labels={labels.restore}
                  onRestore={(id) => {
                    onRestore(id);
                    const node = review.current;
                    const document = node?.ownerDocument;
                    document?.defaultView?.requestAnimationFrame(() => {
                      if (
                        node?.isConnected &&
                        document.activeElement === document.body
                      ) {
                        node
                          .querySelector<HTMLInputElement>(
                            '.rv-history-versions input:checked',
                          )
                          ?.focus();
                      }
                    });
                  }}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <p class="rv-history-summary" role="status">
          {labels.noVersions}
        </p>
      )}
    </section>
  );
  return open === undefined ? (
    content
  ) : (
    <Dialog
      open={open}
      title={label}
      closeLabel={labels.close}
      onClose={() => onClose?.()}
    >
      {content}
    </Dialog>
  );
}
