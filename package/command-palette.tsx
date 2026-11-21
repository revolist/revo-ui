import { h } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { ClassPreset } from './presets/types';
import { Dialog } from './pickers';
import { SearchInput } from './search-input';
import { Button } from './controls';
/** Host-owned action displayed in the palette. */
export interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  keywords?: readonly string[];
}
export interface CommandPaletteProps {
  /** Whether the dialog is open. */ open: boolean;
  /** Localized dialog title. */ label: string;
  /** Localized search label. */ searchLabel: string;
  /** Localized close action. */ closeLabel: string;
  /** Localized empty-results message. */ emptyLabel: string;
  /** Commands in display order. */ commands: readonly PaletteCommand[];
  /** Called when the dialog closes. */ onClose: () => void;
  /** Called when an enabled command is activated. */ onExecute: (
    id: string,
  ) => void;
  /** Optional presentation preset. */ preset?: ClassPreset;
}
/** Searchable command dialog. The host owns opening and executing commands. */
export function CommandPalette({
  open,
  label,
  searchLabel,
  closeLabel,
  emptyLabel,
  commands,
  onClose,
  onExecute,
  preset,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
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
    if (!open) setQuery('');
  }, [open]);
  const needle = query.trim().toLocaleLowerCase();
  const matches = commands.filter((c) =>
    [c.label, c.description ?? '', ...(c.keywords ?? [])].some((v) =>
      v.toLocaleLowerCase().includes(needle),
    ),
  );
  return (
    <Dialog
      open={open}
      title={label}
      closeLabel={closeLabel}
      onClose={onClose}
      preset={preset}
    >
      <div class="rv-command-palette" data-part="root">
        <SearchInput
          aria-label={searchLabel}
          placeholder={searchLabel}
          inputRef={focusSearch}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              const first = results.current?.querySelector<HTMLButtonElement>(
                'button:not(:disabled)',
              );
              if (first) {
                event.preventDefault();
                first.focus();
              }
            }
          }}
          value={query}
          onValueChange={setQuery}
        />
        <div
          ref={results}
          class="rv-command-list"
          data-part="results"
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
              return;
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>(
                'button:not(:disabled)',
              ),
            );
            const i = buttons.indexOf(event.target as HTMLButtonElement);
            if (i < 0 || !buttons.length) return;
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : (i +
                      (event.key === 'ArrowDown' ? 1 : -1) +
                      buttons.length) %
                    buttons.length;
            event.preventDefault();
            buttons[next].focus();
          }}
        >
          {matches.map((command) => (
            <Button
              key={command.id}
              variant="ghost"
              disabled={command.disabled}
              onClick={() => {
                onExecute(command.id);
                onClose();
              }}
            >
              <span>
                {command.label}
                {command.description && <small>{command.description}</small>}
              </span>
            </Button>
          ))}
          <p class="rv-command-status" role="status">
            {matches.length ? '' : emptyLabel}
          </p>
        </div>
      </div>
    </Dialog>
  );
}
