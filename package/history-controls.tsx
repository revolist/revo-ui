/** @jsxImportSource preact */
import { h } from 'preact';
import undoIcon from '@fortawesome/fontawesome-free/svgs/solid/rotate-left.svg?raw';
import redoIcon from '@fortawesome/fontawesome-free/svgs/solid/rotate-right.svg?raw';
import { SvgButton } from './buttons/svg-button';

export interface HistoryControlsProps {
  onUndo?(): void;
  onRedo?(): void;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel?: string;
  redoLabel?: string;
  label?: string;
  undoCount?: number;
  redoCount?: number;
}

/** Shared history presentation; the consumer retains ownership of replay and state. */
export function HistoryControls({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  undoLabel = 'Undo',
  redoLabel = 'Redo',
  label = 'History',
  undoCount,
  redoCount,
}: HistoryControlsProps) {
  return (
    <div class="rv-history-controls" role="group" aria-label={label}>
      {onUndo && (
        <SvgButton
          icon={undoIcon}
          label={undoLabel}
          badge={undoCount}
          disabled={!canUndo}
          onClick={onUndo}
        />
      )}
      {onRedo && (
        <SvgButton
          icon={redoIcon}
          label={redoLabel}
          badge={redoCount}
          disabled={!canRedo}
          onClick={onRedo}
        />
      )}
    </div>
  );
}
