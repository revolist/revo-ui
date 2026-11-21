import { h, type ComponentChildren } from 'preact';
import { useCallback, useEffect, useId, useRef, useState } from 'preact/hooks';
import type { ClassPreset } from './presets/types';
import { Dialog } from './pickers';
import { SearchInput } from './search-input';
import { Button } from './controls';

/** Host-owned action displayed in the palette. */
export interface PaletteCommand {
  /** Unique action ID passed to onExecute. */
  id: string;
  /** Visible command text. */
  label: string;
  /** Supporting text that is also searchable. */
  description?: string;
  /** Whether this command can be executed. */
  disabled?: boolean;
  /** Additional searchable terms. */
  keywords?: readonly string[];
  /** Optional heading for a group of related commands. */
  group?: string;
  /** Optional decorative icon. */
  icon?: ComponentChildren;
  /** Display hint for a shortcut registered by the host. */
  shortcut?: string;
}

export interface CommandPaletteProps {
  /** Whether the dialog is open. */
  open?: boolean;
  /** Localized dialog or inline palette title. */
  label: string;
  /** Localized search label and placeholder. */
  searchLabel: string;
  /** Localized close action. */
  closeLabel?: string;
  /** Localized empty-results message. */
  emptyLabel: string;
  /** Commands in display order. Commands with the same group appear together. */
  commands: readonly PaletteCommand[];
  /** Show a persistent inline command list. Dialog props are ignored in this mode. */
  inline?: boolean;
  /** Wrap arrow navigation at the beginning and end of the results. */
  loop?: boolean;
  /** Called when the dialog closes. */
  onClose?: () => void;
  /** Called when an enabled command is activated. */
  onExecute: (id: string) => void;
  /** Optional presentation preset. */
  preset?: ClassPreset;
}

/** Searchable commands for a modal or inline surface. The host executes commands. */
export function CommandPalette({
  open = false,
  label,
  searchLabel,
  closeLabel = 'Close',
  emptyLabel,
  commands,
  inline = false,
  loop = false,
  onClose,
  onExecute,
  preset,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string>();
  const listId = useId();
  const results = useRef<HTMLDivElement>(null);
  const focusFrame = useRef<number>();
  const focusSearch = useCallback((element: HTMLInputElement | null) => {
    if (focusFrame.current !== undefined)
      cancelAnimationFrame(focusFrame.current);
    if (element)
      focusFrame.current = requestAnimationFrame(() => {
        if (element.isConnected) element.focus();
      });
  }, []);

  useEffect(() => {
    if (!open && !inline) {
      setQuery('');
      setActiveId(undefined);
    }
  }, [open, inline]);

  const needle = query.trim().toLocaleLowerCase();
  const groups = new Map<string, PaletteCommand[]>();
  for (const command of commands) {
    const terms = [
      command.label,
      command.description ?? '',
      ...(command.keywords ?? []),
    ];
    if (!terms.some((term) => term.toLocaleLowerCase().includes(needle)))
      continue;
    const key = command.group ?? '';
    const entries = groups.get(key);
    if (entries) entries.push(command);
    else groups.set(key, [command]);
  }
  const matches = Array.from(groups.values()).flat();
  const enabled = matches.filter((command) => !command.disabled);
  const active =
    enabled.find((command) => command.id === activeId) ?? enabled[0];
  const optionId = (index: number) => `${listId}-option-${index}`;
  const selected = active ? optionId(matches.indexOf(active)) : undefined;

  useEffect(() => {
    const list = results.current;
    const option = selected && list?.ownerDocument.getElementById(selected);
    if (
      option &&
      list?.contains(option) &&
      list.ownerDocument.activeElement?.getAttribute('aria-controls') === listId
    ) {
      option.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [selected, listId]);

  function execute(command: PaletteCommand) {
    if (command.disabled) return;
    onExecute(command.id);
    if (!inline) onClose?.();
  }

  function renderOptions(entries: PaletteCommand[]) {
    return entries.map((command) => (
      <Button
        key={command.id}
        id={optionId(matches.indexOf(command))}
        data-part="option"
        role="option"
        tabIndex={-1}
        aria-selected={command === active}
        aria-disabled={command.disabled || undefined}
        variant="ghost"
        disabled={command.disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => execute(command)}
      >
        {command.icon && (
          <span class="rv-command-icon" aria-hidden="true">
            {command.icon}
          </span>
        )}
        <span class="rv-command-copy">
          {command.label}
          {command.description && <small>{command.description}</small>}
        </span>
        {command.shortcut && (
          <kbd class="rv-command-shortcut">{command.shortcut}</kbd>
        )}
      </Button>
    ));
  }

  const content = (
    <div
      class={`rv-command-palette${inline ? ` rv-command-inline ${preset?.className ?? ''}` : ''}`}
      data-part="root"
    >
      <SearchInput
        aria-label={searchLabel}
        placeholder={searchLabel}
        role="combobox"
        type="text"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={matches.length > 0}
        aria-activedescendant={selected}
        inputRef={inline ? undefined : focusSearch}
        onKeyDown={(event) => {
          if (event.isComposing || !active) return;
          const key = event.key;
          const ctrl = event.ctrlKey && !event.metaKey && !event.altKey;
          const forward =
            key === 'ArrowDown' || (ctrl && (key === 'n' || key === 'j'));
          const backward =
            key === 'ArrowUp' || (ctrl && (key === 'p' || key === 'k'));
          const index = enabled.indexOf(active);
          let next: PaletteCommand | undefined;
          if (key === 'Enter') {
            event.preventDefault();
            execute(active);
            return;
          }
          if (key === 'Home') next = enabled[0];
          else if (key === 'End') next = enabled.at(-1);
          else if ((forward || backward) && event.altKey) {
            const starts = [...groups.values()]
              .map((entries) => entries.find((command) => !command.disabled))
              .filter((command): command is PaletteCommand => !!command);
            const groupIndex = starts.findIndex(
              (command) => command.group === active.group,
            );
            next = starts[groupIndex + (forward ? 1 : -1)];
          } else if (forward || backward) {
            const target = index + (forward ? 1 : -1);
            next =
              enabled[
                loop ? (target + enabled.length) % enabled.length : target
              ];
          } else {
            return;
          }
          event.preventDefault();
          if (next) setActiveId(next.id);
        }}
        value={query}
        onValueChange={(value) => {
          setQuery(value);
          setActiveId(undefined);
        }}
      />
      <div
        class="rv-command-list"
        data-part="results"
        id={listId}
        ref={results}
        role="listbox"
        aria-label={label}
      >
        {[...groups].map(([group, entries]) =>
          group ? (
            <div
              class="rv-command-group"
              key={group}
              role="group"
              aria-label={group}
            >
              <div class="rv-command-heading" aria-hidden="true">
                {group}
              </div>
              {renderOptions(entries)}
            </div>
          ) : (
            renderOptions(entries)
          ),
        )}
      </div>
      <p class="rv-command-status" role="status">
        {matches.length ? '' : emptyLabel}
      </p>
    </div>
  );
  return inline ? (
    content
  ) : (
    <Dialog
      open={open}
      title={label}
      closeLabel={closeLabel}
      onClose={() => onClose?.()}
      preset={preset}
    >
      {content}
    </Dialog>
  );
}
