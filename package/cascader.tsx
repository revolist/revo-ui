import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { ClassPreset } from './presets/types';
import { Button } from './controls';
import { Popover } from './pickers';
import { Tree, type TreeNode } from './tree';
import { SvgIcon, chevronDownIcon } from './icons';
/** Hierarchical selector using the shared Tree and Popover. */
export interface CascaderProps {
  /** Accessible label for the trigger and selection panel. */ label: string;
  /** Root options with unique IDs. */ nodes: readonly TreeNode[];
  /** Selected option ID. */ value?: string;
  /** Text shown when no option is selected. */ placeholder: string;
  /** Called when a leaf option is selected. */ onValueChange?: (
    id: string,
  ) => void;
  /** Optional presentation preset. */ preset?: ClassPreset;
  /** Additional root class names. */ className?: string;
  /** Disable opening and selection. */ disabled?: boolean;
}
function findNode(
  nodes: readonly TreeNode[],
  id?: string,
): TreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findNode(node.children ?? [], id);
    if (child) return child;
  }
  return undefined;
}
function findAncestors(
  nodes: readonly TreeNode[],
  id?: string,
): string[] | undefined {
  for (const node of nodes) {
    if (node.id === id) return [];
    const ancestors = findAncestors(node.children ?? [], id);
    if (ancestors) return [node.id, ...ancestors];
  }
  return undefined;
}
export function Cascader({
  label,
  nodes,
  value,
  placeholder,
  onValueChange,
  preset,
  className = '',
  disabled,
}: CascaderProps) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<string>();
  const [expanded, setExpanded] = useState<readonly string[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const selected = value ?? localValue;
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() =>
      panel.current
        ?.querySelector<HTMLElement>('[role="treeitem"][tabindex="0"]')
        ?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);
  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  return (
    <div
      class={`rv-cascader ${preset?.className ?? ''} ${className}`}
      data-part="root"
    >
      <Button
        ref={trigger}
        aria-label={`${label}: ${findNode(nodes, selected)?.label ?? placeholder}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => {
          if (!open) setExpanded(findAncestors(nodes, selected) ?? []);
          setOpen(!open);
        }}
      >
        <span>{findNode(nodes, selected)?.label ?? placeholder}</span>
        <SvgIcon svg={chevronDownIcon} size={10} />
      </Button>
      <Popover
        open={open}
        anchor={trigger.current}
        appendTo={trigger.current?.parentElement ?? undefined}
        label={label}
        onClose={() => setOpen(false)}
      >
        <div
          ref={panel}
          class="rv-cascader-panel"
          data-part="panel"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          <Tree
            label={label}
            nodes={nodes}
            value={selected ?? ''}
            expanded={expanded}
            onExpandedChange={setExpanded}
            onValueChange={(id) => {
              const node = findNode(nodes, id);
              if (node?.children?.length) {
                setExpanded((current) =>
                  current.includes(id)
                    ? current.filter((item) => item !== id)
                    : [...current, id],
                );
              } else if (node) {
                if (value === undefined) setLocalValue(id);
                onValueChange?.(id);
                setOpen(false);
                trigger.current?.focus();
              }
            }}
          />
        </div>
      </Popover>
    </div>
  );
}
