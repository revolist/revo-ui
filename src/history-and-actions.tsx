import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import {
  ActionBar,
  BackupHistory,
  Button,
  Checkbox,
  HistoryReview,
} from '@revolist/ui/preact';
import type {
  BackupSnapshot,
  HistoryReviewLabels,
  HistoryVersion,
} from '@revolist/ui/preact';
import archiveIcon from '@fortawesome/fontawesome-free/svgs/solid/box-archive.svg?raw';
import downloadIcon from '@fortawesome/fontawesome-free/svgs/solid/download.svg?raw';
import { Example } from './catalog';
import alexPhoto from './assets/people/contact-2.jpg';
import morganPhoto from './assets/people/contact-3.jpg';

const files = ['Forecast.xlsx', 'Research notes.md', 'Launch brief.pdf'];

export function ActionBarExamples() {
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [showInline, setShowInline] = useState(true);
  return (
    <>
      <Example title="Bulk file actions">
        <div class="rv-demo-file-list" role="group" aria-label="Project files">
          {files.map((file) => (
            <Checkbox
              key={file}
              label={file}
              checked={selected.includes(file)}
              onChange={(checked) =>
                setSelected((current) =>
                  checked
                    ? [...current, file]
                    : current.filter((item) => item !== file),
                )
              }
            />
          ))}
        </div>
        <output role="status">{message}</output>
        <ActionBar
          label="Actions for selected files"
          count={selected.length}
          selectionLabel={
            selected.length === 1
              ? '1 file selected'
              : `${selected.length} files selected`
          }
          closeLabel="Clear file selection"
          actions={[
            { id: 'download', label: 'Download', icon: downloadIcon },
            { id: 'archive', label: 'Archive', icon: archiveIcon },
          ]}
          onAction={(id) => {
            setMessage(
              id === 'archive'
                ? 'Archived selected files'
                : 'Prepared selected files for download',
            );
            setSelected([]);
          }}
          onOpenChange={() => setSelected([])}
        />
      </Example>
      <Example title="Inline actions in RTL">
        <div dir="rtl" class="rv-demo-file-list">
          <Button onClick={() => setShowInline((open) => !open)}>
            {showInline ? 'إخفاء الإجراءات' : 'إظهار الإجراءات'}
          </Button>
          <ActionBar
            label="إجراءات الملفات المحددة"
            count={2}
            selectionLabel="ملفان محددان"
            closeLabel="إغلاق"
            open={showInline}
            closeOnEscape={false}
            positioning={{ mode: 'inline', placement: 'bottom-start' }}
            actions={[
              { id: 'download', label: 'تنزيل', icon: downloadIcon },
              {
                id: 'archive',
                label: 'أرشفة',
                icon: archiveIcon,
                disabled: true,
              },
            ]}
            onAction={() => setShowInline(false)}
            onOpenChange={setShowInline}
          />
        </div>
      </Example>
    </>
  );
}

export const historyLabels: HistoryReviewLabels = {
  versions: 'Saved versions',
  comparison: 'Compare with',
  changesTable: 'Cell changes',
  previous: 'Previous',
  current: 'Latest',
  currentVersion: 'Current',
  address: 'Cell',
  before: 'Before',
  after: 'After',
  emptyValue: 'Empty',
  noVersions: 'No saved versions',
  noPrevious: 'No earlier version to compare',
  noChanges: 'No cell changes',
  close: 'Close history',
  changeCount: (count) =>
    count === 1 ? '1 cell changed' : `${count} cells changed`,
  restore: {
    restore: 'Restore version',
    title: 'Restore this version?',
    confirm: 'Confirm restore',
    cancel: 'Keep current version',
    close: 'Close confirmation',
  },
};

const initialVersions: readonly HistoryVersion[] = [
  {
    id: 'v3',
    title: 'Budget approved',
    dateLabel: 'Nov 20, 10:42',
    dateTime: '2026-11-20T10:42:00Z',
    author: 'Alex Chen',
    authorAvatarUrl: alexPhoto,
    cells: [
      { id: 'budget', address: 'B4', sheet: 'Budget', value: '$28,000' },
      { id: 'status', address: 'C4', sheet: 'Budget', value: 'Approved' },
      { id: 'review', address: 'D4', sheet: 'Budget', value: 'Dec 5' },
    ],
  },
  {
    id: 'v2',
    title: 'Forecast updated',
    dateLabel: 'Nov 19, 14:10',
    dateTime: '2026-11-19T14:10:00Z',
    author: 'Morgan Lee',
    authorAvatarUrl: morganPhoto,
    cells: [
      { id: 'budget', address: 'B4', sheet: 'Budget', value: '$26,500' },
      { id: 'status', address: 'C4', sheet: 'Budget', value: 'In review' },
    ],
  },
  {
    id: 'v1',
    title: 'Initial budget',
    dateLabel: 'Nov 18, 09:05',
    dateTime: '2026-11-18T09:05:00Z',
    author: 'Alex Chen',
    authorAvatarUrl: alexPhoto,
    cells: [
      { id: 'budget', address: 'B4', sheet: 'Budget', value: '$24,000' },
      { id: 'status', address: 'C4', sheet: 'Budget', value: 'Draft' },
    ],
  },
];

const commentVersions: readonly HistoryVersion[] = [
  {
    id: 'edit-2',
    title: 'Clarified deadline',
    dateLabel: 'Nov 20, 11:24',
    author: 'Morgan Lee',
    authorAvatarUrl: morganPhoto,
    cells: [
      {
        id: 'handoff',
        address: 'D12',
        sheet: 'Launch',
        value: 'Share the reviewed draft by Thursday at noon.',
      },
    ],
  },
  {
    id: 'edit-1',
    title: 'Original comment',
    dateLabel: 'Nov 20, 10:58',
    author: 'Morgan Lee',
    authorAvatarUrl: morganPhoto,
    cells: [
      {
        id: 'handoff',
        address: 'D12',
        sheet: 'Launch',
        value: 'Share the draft this week.',
      },
    ],
  },
];

export function HistoryReviewExamples() {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState(initialVersions);
  const [value, setValue] = useState(initialVersions[0].id);
  const [notice, setNotice] = useState('');
  const revision = useRef(0);
  return (
    <>
      <Example title="Grid version history">
        <Button onClick={() => setOpen(true)}>Open version history</Button>
        <output role="status">{notice}</output>
        <HistoryReview
          label="Budget version history"
          open={open}
          onClose={() => setOpen(false)}
          versions={versions}
          value={value}
          onValueChange={setValue}
          labels={historyLabels}
          onRestore={(id) => {
            const original = versions.find((entry) => entry.id === id);
            if (!original) return;
            const restored = {
              ...original,
              id: `restore-${++revision.current}`,
              title: `Restored from ${original.title}`,
              dateLabel: 'Just now',
              dateTime: undefined,
            };
            setVersions((previous) => [restored, ...previous]);
            setValue(restored.id);
            setNotice(restored.title);
          }}
        />
      </Example>
      <Example title="History without versions">
        <HistoryReview
          label="History without versions"
          versions={commentVersions}
          labels={historyLabels}
          showVersions={false}
        />
      </Example>
      <Example title="History without comparison controls">
        <HistoryReview
          label="History without comparison controls"
          versions={commentVersions}
          labels={historyLabels}
          showComparisonControls={false}
        />
      </Example>
      <Example title="Custom history slot">
        <HistoryReview
          label="Custom history slot"
          versions={commentVersions}
          labels={historyLabels}
          showComparisonControls={false}
        >
          <p>External event details</p>
        </HistoryReview>
      </Example>
      <Example title="Compact event history">
        <HistoryReview
          label="Compact event history"
          versions={[
            {
              id: 'event-2',
              title: 'Updated',
              dateLabel: 'Today',
              data: ['Status changed', 'Owner assigned'],
            },
            {
              id: 'event-1',
              title: 'Created',
              dateLabel: 'Yesterday',
              data: 'Created',
            },
          ]}
          labels={historyLabels}
          showVersions={false}
          showComparisonControls={false}
          renderChanges={({ selected }) => (
            <ul>
              {(Array.isArray(selected.data)
                ? selected.data
                : [selected.data]
              ).map((event) => (
                <li>{String(event)}</li>
              ))}
            </ul>
          )}
        />
      </Example>
      <Example title="Cell comment edits">
        <HistoryReview
          label="Comment edit history"
          versions={commentVersions}
          labels={{
            ...historyLabels,
            comparison: 'Compare edits with',
            previous: 'Earlier edit',
            current: 'Latest edit',
          }}
        />
      </Example>
    </>
  );
}

export const demoBackups: readonly BackupSnapshot[] = [
  {
    id: 'BK-036',
    title: 'Backup BK-036',
    dateLabel: 'Nov 12',
    dateTime: '2026-11-12',
    kind: 'Full',
    size: '17.6 GB',
    status: 'Verified',
    duration: '6 min',
    majorTick: true,
  },
  {
    id: 'BK-037',
    title: 'Backup BK-037',
    dateLabel: 'Nov 13',
    dateTime: '2026-11-13',
    kind: 'Incremental',
    size: '1.1 GB',
    status: 'Complete',
    duration: '1 min',
  },
  {
    id: 'BK-038',
    title: 'Backup BK-038',
    dateLabel: 'Nov 14',
    dateTime: '2026-11-14',
    kind: 'Incremental',
    size: '1.3 GB',
    change: '+200 MB from the previous incremental',
    status: 'Verified',
    duration: '2 min',
  },
  {
    id: 'BK-039',
    title: 'Backup BK-039',
    dateLabel: 'Nov 15',
    dateTime: '2026-11-15',
    kind: 'Full',
    size: '17.9 GB',
    change: '+300 MB from the previous full backup',
    status: 'Verified',
    duration: '7 min',
    majorTick: true,
  },
  {
    id: 'BK-040',
    title: 'Backup BK-040',
    dateLabel: 'Nov 16',
    dateTime: '2026-11-16',
    kind: 'Incremental',
    size: '1.2 GB',
    change: '−100 MB from the previous incremental',
    status: 'Complete',
    duration: '1 min',
  },
  {
    id: 'BK-041',
    title: 'Backup BK-041',
    dateLabel: 'Nov 17',
    dateTime: '2026-11-17',
    kind: 'Full',
    majorTick: true,
    size: '18.2 GB',
    status: 'Verified',
    duration: '6 min',
  },
  {
    id: 'BK-042',
    title: 'Backup BK-042',
    dateLabel: 'Nov 18',
    dateTime: '2026-11-18',
    kind: 'Incremental',
    size: '1.4 GB',
    status: 'Complete',
    duration: '1 min',
  },
  {
    id: 'BK-043',
    title: 'Backup BK-043',
    dateLabel: 'Nov 19',
    dateTime: '2026-11-19',
    kind: 'Incremental',
    status: 'Failed',
    restoreDisabled: true,
  },
  {
    id: 'BK-044',
    title: 'Backup BK-044',
    dateLabel: 'Nov 20',
    dateTime: '2026-11-20',
    kind: 'Full',
    majorTick: true,
    size: '19.1 GB',
    change: '+0.9 GB from the previous full backup',
    status: 'Verified',
    duration: '7 min',
  },
];

export const backupLabels = {
  empty: 'No backups saved',
  scrubber: 'Browse snapshots',
  previous: 'Previous',
  next: 'Next',
  preview: 'Preview restore',
  taken: 'Taken',
  duration: 'Duration',
  restore: {
    restore: 'Restore',
    title: 'Restore this snapshot?',
    confirm: 'Confirm restore',
    cancel: 'Keep current data',
    close: 'Close confirmation',
  },
  position: (index: number, total: number, snapshot: BackupSnapshot) =>
    `Snapshot ${index} of ${total}, ${[snapshot.dateLabel, snapshot.kind, snapshot.size ?? snapshot.status].filter(Boolean).join(', ')}`,
};

export function BackupHistoryExamples() {
  const [message, setMessage] = useState('');
  return (
    <Example title="Backup snapshots">
      <BackupHistory
        label="Workspace backups"
        snapshots={demoBackups}
        labels={backupLabels}
        onPreview={(id) => setMessage(`Preview ready for ${id}`)}
        onRestore={(id) => setMessage(`Restore confirmed for ${id}`)}
      />
      <output role="status">{message}</output>
    </Example>
  );
}
