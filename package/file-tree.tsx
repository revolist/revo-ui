import { Fragment, h } from 'preact';
import { useState } from 'preact/hooks';
import fileIcon from '@fortawesome/fontawesome-free/svgs/regular/file.svg?raw';
import folderIcon from '@fortawesome/fontawesome-free/svgs/regular/folder.svg?raw';
import { Button, Disclosure } from './controls';
import { chevronDownIcon, SvgIcon } from './icons';
import type { ClassPreset } from './presets/types';

export type FileChangeStatus = 'added' | 'modified' | 'deleted';

interface FileTreeEntry {
  /** Displayed filename or folder name. */
  name: string;
  /** Unique path relative to the root. */
  path: string;
}

export type FileTreeNode =
  | (FileTreeEntry & {
      type: 'file';
      /** Optional source-control change marker. */
      status?: FileChangeStatus;
    })
  | (FileTreeEntry & {
      type: 'folder';
      /** Nested files and folders, in display order. */
      children?: readonly FileTreeNode[];
    });

/** Group unique relative file paths into folders, preserving first-seen order. */
export function fileTreeFromPaths(paths: readonly string[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const folders = new Map<string, FileTreeNode[]>();
  const seenFiles = new Set<string>();
  nextPath: for (const path of new Set(paths)) {
    const segments = path.split('/');
    if (
      segments.some(
        (segment) => !segment || segment === '.' || segment === '..',
      )
    )
      continue;
    if (folders.has(path)) continue;
    let siblings = root;
    let folderPath = '';
    for (const name of segments.slice(0, -1)) {
      folderPath = folderPath ? folderPath + '/' + name : name;
      if (seenFiles.has(folderPath)) continue nextPath;
      let children = folders.get(folderPath);
      if (!children) {
        children = [];
        folders.set(folderPath, children);
        siblings.push({ type: 'folder', name, path: folderPath, children });
      }
      siblings = children;
    }
    siblings.push({ type: 'file', path, name: segments[segments.length - 1] });
    seenFiles.add(path);
  }
  return root;
}

function collectFolders(nodes: readonly FileTreeNode[]): string[] {
  return nodes.flatMap((node) =>
    node.type === 'folder'
      ? [node.path, ...collectFolders(node.children ?? [])]
      : [],
  );
}

const statusPresentation = {
  added: { marker: 'A', label: 'Added' },
  modified: { marker: 'M', label: 'Modified' },
  deleted: { marker: 'D', label: 'Deleted' },
} satisfies Record<FileChangeStatus, { marker: string; label: string }>;

export interface FileTreeProps {
  /** Accessible name of the file list. */
  label: string;
  /** Files and folders in display order. */
  nodes: readonly FileTreeNode[];
  /** Controlled selected path. Use an empty string for no selection. */
  value?: string;
  /** Initially selected path when uncontrolled. */
  defaultValue?: string;
  /** Controlled list of open folder paths. */
  expanded?: readonly string[];
  /** Called with the open folder paths after a folder toggles. */
  onExpandedChange?: (paths: string[]) => void;
  /** Initially open folders. Omit to start with all folders open. */
  defaultExpanded?: readonly string[];
  /** Called when a file is selected. */
  onValueChange?: (path: string) => void;
  /** Localized accessible status names and optional visible marker letters. */
  statusLabels?: Partial<
    Record<FileChangeStatus, { label: string; marker?: string }>
  >;
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional root class names. */
  className?: string;
}

/** Browse a compact set of files using native folder disclosures and file actions. */
export function FileTree({
  label,
  nodes,
  value,
  defaultValue,
  expanded,
  defaultExpanded,
  onExpandedChange,
  onValueChange,
  statusLabels,
  preset,
  className = '',
}: FileTreeProps) {
  const [selected, setSelected] = useState(defaultValue);
  const [initialFolders] = useState(
    () => defaultExpanded && new Set(defaultExpanded),
  );
  const [overrides, setOverrides] = useState<ReadonlyMap<string, boolean>>(
    () => new Map(),
  );
  const openPaths =
    expanded ??
    collectFolders(nodes).filter(
      (path) => overrides.get(path) ?? initialFolders?.has(path) ?? true,
    );
  const openFolders = new Set(openPaths);
  const current = value ?? selected;

  function renderNodes(items: readonly FileTreeNode[]) {
    return items.map((node) => {
      if (node.type === 'folder') {
        return (
          <li key={node.path} data-part="folder">
            <Disclosure
              open={openFolders.has(node.path)}
              onToggle={(event) => {
                const folder = event.currentTarget;
                const wasOpen = openFolders.has(node.path);
                if (folder.open === wasOpen) return;
                const next = folder.open
                  ? [...openFolders, node.path]
                  : openPaths.filter((path) => path !== node.path);
                if (expanded === undefined) {
                  const open = folder.open;
                  setOverrides((previous) =>
                    new Map(previous).set(node.path, open),
                  );
                } else {
                  folder.open = wasOpen;
                }
                onExpandedChange?.(next);
              }}
              className="rv-file-tree-folder"
              summary={
                <>
                  <SvgIcon
                    svg={chevronDownIcon}
                    size={10}
                    className="rv-svg-icon rv-file-tree-chevron"
                  />
                  <SvgIcon svg={folderIcon} size={14} />
                  <span class="rv-file-tree-name">{node.name}</span>
                </>
              }
            >
              <ul role="list">{renderNodes(node.children ?? [])}</ul>
            </Disclosure>
          </li>
        );
      }

      const status = node.status;
      const presentation = status && statusPresentation[status];
      const translation = status && statusLabels?.[status];
      return (
        <li key={node.path} data-part="file">
          <Button
            variant="ghost"
            className="rv-file-tree-file"
            aria-current={current === node.path ? 'true' : undefined}
            aria-description={translation?.label ?? presentation?.label}
            onClick={() => {
              if (value === undefined) setSelected(node.path);
              onValueChange?.(node.path);
            }}
          >
            <SvgIcon svg={fileIcon} size={14} />
            <span class="rv-file-tree-name">{node.name}</span>
            {presentation && (
              <span data-part="status" data-status={status}>
                {translation?.marker ?? presentation.marker}
              </span>
            )}
          </Button>
        </li>
      );
    });
  }

  return (
    <ul
      role="list"
      aria-label={label}
      class={`rv-file-tree ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      {renderNodes(nodes)}
    </ul>
  );
}
