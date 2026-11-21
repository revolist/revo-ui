import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, CommandPalette, SvgIcon } from '@revolist/ui/preact';
import type { PaletteCommand } from '@revolist/ui/command-palette';
import folderIcon from '@fortawesome/fontawesome-free/svgs/solid/folder-open.svg?raw';
import peopleIcon from '@fortawesome/fontawesome-free/svgs/solid/users.svg?raw';
import settingsIcon from '@fortawesome/fontawesome-free/svgs/solid/gear.svg?raw';
import calendarIcon from '@fortawesome/fontawesome-free/svgs/solid/calendar-days.svg?raw';
import inboxIcon from '@fortawesome/fontawesome-free/svgs/solid/inbox.svg?raw';
import bookmarkIcon from '@fortawesome/fontawesome-free/svgs/solid/bookmark.svg?raw';
import reportIcon from '@fortawesome/fontawesome-free/svgs/solid/chart-column.svg?raw';
import archiveIcon from '@fortawesome/fontawesome-free/svgs/solid/box-archive.svg?raw';
import { Example } from './catalog';

const workspaceCommands: readonly PaletteCommand[] = [
  {
    id: 'open',
    label: 'Open project',
    group: 'Workspace',
    icon: <SvgIcon svg={folderIcon} />,
    shortcut: '⌘P',
  },
  {
    id: 'team',
    label: 'Browse team',
    group: 'Workspace',
    icon: <SvgIcon svg={peopleIcon} />,
  },
  {
    id: 'schedule',
    label: 'View schedule',
    group: 'Workspace',
    icon: <SvgIcon svg={calendarIcon} />,
  },
  {
    id: 'settings',
    label: 'Open settings',
    group: 'Preferences',
    icon: <SvgIcon svg={settingsIcon} />,
    shortcut: '⌘,',
  },
  {
    id: 'inbox',
    label: 'Notification inbox',
    group: 'Preferences',
    icon: <SvgIcon svg={inboxIcon} />,
  },
];

const quickActions: readonly PaletteCommand[] = [
  {
    id: 'bookmark',
    label: 'Bookmark this view',
    icon: <SvgIcon svg={bookmarkIcon} />,
  },
  { id: 'report', label: 'Create report', icon: <SvgIcon svg={reportIcon} /> },
  {
    id: 'archive',
    label: 'Archive workspace',
    icon: <SvgIcon svg={archiveIcon} />,
    disabled: true,
  },
];

const projectCommands: readonly PaletteCommand[] = [
  ...workspaceCommands,
  ...[
    'Research',
    'Launch',
    'Roadmap',
    'Reporting',
    'Operations',
    'Design',
    'Customer success',
    'Archive',
  ].map((name) => ({
    id: name,
    label: name,
    group: 'Projects',
    icon: <SvgIcon svg={folderIcon} />,
  })),
  ...['Project health', 'Delivery forecast', 'Weekly summary'].map((name) => ({
    id: name,
    label: name,
    group: 'Reports',
    icon: <SvgIcon svg={reportIcon} />,
  })),
];

const rtlCommands: readonly PaletteCommand[] = [
  {
    id: 'project',
    label: 'فتح المشروع',
    group: 'مساحة العمل',
    icon: <SvgIcon svg={folderIcon} />,
  },
  {
    id: 'team',
    label: 'عرض الفريق',
    group: 'مساحة العمل',
    icon: <SvgIcon svg={peopleIcon} />,
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    group: 'التفضيلات',
    icon: <SvgIcon svg={settingsIcon} />,
  },
];

export function CommandPaletteExamples() {
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [result, setResult] = useState('');
  const [quickResult, setQuickResult] = useState('');
  const [projectResult, setProjectResult] = useState('');
  const [rtlResult, setRtlResult] = useState('');

  useEffect(() => {
    const document = launcher.current?.ownerDocument;
    if (!document) return;
    function shortcut(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k' &&
        !event.defaultPrevented &&
        launcher.current?.isConnected &&
        !document?.querySelector(
          'dialog[open], [role="dialog"][aria-modal="true"]',
        )
      ) {
        event.preventDefault();
        launcher.current.focus();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);

  return (
    <>
      <Example title="Workspace commands">
        <Button
          ref={launcher}
          onClick={() => setOpen(true)}
          aria-keyshortcuts="Meta+K Control+K"
        >
          Open commands{' '}
          <kbd class="rv-keycap" aria-hidden="true">
            ⌘ / Ctrl + K
          </kbd>
        </Button>
        <p role="status">{result}</p>
        <CommandPalette
          open={open}
          label="Commands"
          searchLabel="Search commands"
          emptyLabel="No matching commands"
          commands={workspaceCommands}
          onClose={() => setOpen(false)}
          onExecute={(id) =>
            setResult(
              workspaceCommands.find((command) => command.id === id)?.label ??
                '',
            )
          }
        />
      </Example>
      <Example title="Quick actions">
        <CommandPalette
          inline
          loop
          label="Quick actions"
          searchLabel="Search actions"
          emptyLabel="No matching actions"
          commands={quickActions}
          onExecute={(id) =>
            setQuickResult(
              quickActions.find((command) => command.id === id)?.label ?? '',
            )
          }
        />
        <p role="status">{quickResult}</p>
      </Example>
      <Example title="Scrollable commands">
        <Button onClick={() => setProjectsOpen(true)}>Browse workspace</Button>
        <p role="status">{projectResult}</p>
        <CommandPalette
          open={projectsOpen}
          label="Browse workspace"
          searchLabel="Search workspace"
          emptyLabel="No matching items"
          commands={projectCommands}
          onClose={() => setProjectsOpen(false)}
          onExecute={(id) =>
            setProjectResult(
              projectCommands.find((command) => command.id === id)?.label ?? '',
            )
          }
        />
      </Example>
      <Example title="Right-to-left commands">
        <div dir="rtl">
          <CommandPalette
            inline
            label="أوامر مساحة العمل"
            searchLabel="البحث في الأوامر"
            emptyLabel="لا توجد أوامر مطابقة"
            commands={rtlCommands}
            onExecute={(id) =>
              setRtlResult(
                rtlCommands.find((command) => command.id === id)?.label ?? '',
              )
            }
          />
          <p role="status">{rtlResult}</p>
        </div>
      </Example>
    </>
  );
}
