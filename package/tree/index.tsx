import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import type { ClassPreset } from '../presets/types';
import { SvgIcon, chevronDownIcon } from '../icons';

/** One uniquely identified node in a tree. Children are provided by the host. */
export interface TreeNode {
  id: string;
  label: string;
  disabled?: boolean;
  children?: readonly TreeNode[];
}

export interface TreeProps {
  /** Root nodes in display order. */
  nodes: readonly TreeNode[];
  /** Accessible name for the tree. */
  label: string;
  /** Controlled selected node ID. */
  value?: string;
  /** Initially selected node ID when uncontrolled. */
  defaultValue?: string;
  /** Controlled IDs of expanded branches. */
  expanded?: readonly string[];
  /** Initially expanded branch IDs when uncontrolled. */
  defaultExpanded?: readonly string[];
  /** Called after an enabled node is selected. */
  onValueChange?: (id: string) => void;
  /** Called with expanded branch IDs after disclosure changes. */
  onExpandedChange?: (ids: string[]) => void;
  /** Optional shared presentation preset. */
  preset?: ClassPreset;
  /** Additional root class names. */
  className?: string;
}

/** Hierarchical, single-selection tree with keyboard navigation. */
export function Tree({
  nodes,
  label,
  value,
  defaultValue,
  expanded,
  defaultExpanded = [],
  onValueChange,
  onExpandedChange,
  preset,
  className = '',
}: TreeProps) {
  const [localValue, setLocalValue] = useState(defaultValue);
  const [localExpanded, setLocalExpanded] =
    useState<readonly string[]>(defaultExpanded);
  const open = expanded ?? localExpanded;
  const selected = value ?? localValue;
  const [focusId, setFocusId] = useState<string>();
  const refs = useRef(new Map<string, HTMLDivElement>());
  const typeahead = useRef({ text: '', time: 0 });
  const visible: {
    node: TreeNode;
    parent?: string;
    level: number;
    position: number;
    size: number;
  }[] = [];
  const visit = (
    items: readonly TreeNode[],
    level: number,
    parent?: string,
  ) => {
    for (const [index, node] of items.entries()) {
      visible.push({
        node,
        parent,
        level,
        position: index + 1,
        size: items.length,
      });
      if (node.children?.length && open.includes(node.id))
        visit(node.children, level + 1, node.id);
    }
  };
  visit(nodes, 1);
  const enabled = visible.filter(({ node }) => !node.disabled);
  const activeId = enabled.some(({ node }) => node.id === focusId)
    ? focusId
    : (enabled.find(({ node }) => node.id === selected)?.node.id ??
      enabled[0]?.node.id);
  const focus = (id?: string) => {
    if (id) {
      setFocusId(id);
      refs.current.get(id)?.focus();
    }
  };
  const toggle = (id: string, next: boolean) => {
    const ids = next
      ? [...new Set([...open, id])]
      : open.filter((item) => item !== id);
    if (expanded === undefined) setLocalExpanded(ids);
    onExpandedChange?.(ids);
  };
  const select = (node: TreeNode) => {
    if (!node.disabled) {
      if (value === undefined) setLocalValue(node.id);
      onValueChange?.(node.id);
    }
  };
  return (
    <div
      class={`rv-tree ${preset?.className ?? ''} ${className}`}
      data-part="root"
      role="tree"
      aria-label={label}
    >
      {visible.map(({ node, parent, level, position, size }) => {
        const branch = !!node.children?.length;
        return (
          <div
            key={node.id}
            ref={(el) => {
              if (el) refs.current.set(node.id, el);
              else refs.current.delete(node.id);
            }}
            role="treeitem"
            data-part="item"
            aria-level={level}
            aria-posinset={position}
            aria-setsize={size}
            aria-expanded={branch ? open.includes(node.id) : undefined}
            aria-selected={selected === node.id}
            aria-disabled={node.disabled || undefined}
            tabIndex={activeId === node.id ? 0 : -1}
            class="rv-tree-item"
            style={{ '--rv-tree-level': level - 1 }}
            onFocus={() => setFocusId(node.id)}
            onClick={() => {
              if (!node.disabled) {
                focus(node.id);
                select(node);
              }
            }}
            onKeyDown={(event) => {
              const index = enabled.findIndex(
                (item) => item.node.id === node.id,
              );
              if (index < 0) return;
              let target: string | undefined;
              if (event.key === 'ArrowDown')
                target = enabled[index + 1]?.node.id;
              else if (event.key === 'ArrowUp')
                target = enabled[index - 1]?.node.id;
              else if (event.key === 'Home') target = enabled[0]?.node.id;
              else if (event.key === 'End') target = enabled.at(-1)?.node.id;
              else if (event.key === 'ArrowRight' && branch) {
                if (!open.includes(node.id)) toggle(node.id, true);
                else
                  target =
                    enabled[index + 1]?.parent === node.id
                      ? enabled[index + 1].node.id
                      : undefined;
              } else if (event.key === 'ArrowLeft') {
                if (branch && open.includes(node.id)) toggle(node.id, false);
                else {
                  let ancestor = parent;
                  while (ancestor) {
                    const item = visible.find(
                      (entry) => entry.node.id === ancestor,
                    );
                    if (!item?.node.disabled) break;
                    ancestor = item.parent;
                  }
                  target = ancestor;
                }
              } else if (event.key === 'Enter' || event.key === ' ')
                select(node);
              else if (
                event.key.length === 1 &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
              ) {
                const now = Date.now();
                const previous =
                  now - typeahead.current.time < 700
                    ? typeahead.current.text
                    : '';
                const character = event.key.toLocaleLowerCase();
                const query =
                  previous === character ? character : previous + character;
                typeahead.current = { text: query, time: now };
                const candidates = [
                  ...enabled.slice(index + 1),
                  ...enabled.slice(0, index + 1),
                ];
                target = candidates.find((item) =>
                  item.node.label.toLocaleLowerCase().startsWith(query),
                )?.node.id;
              } else return;
              event.preventDefault();
              if (target) focus(target);
            }}
          >
            <span
              class="rv-tree-disclosure"
              aria-hidden="true"
              onClick={(event) => {
                if (branch && !node.disabled) {
                  event.stopPropagation();
                  focus(node.id);
                  toggle(node.id, !open.includes(node.id));
                }
              }}
            >
              {branch && <SvgIcon svg={chevronDownIcon} size={10} />}
            </span>
            <span data-part="label">{node.label}</span>
          </div>
        );
      })}
    </div>
  );
}
