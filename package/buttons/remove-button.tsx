/** @jsxImportSource preact */
import { h } from 'preact';
import type { ClassPreset } from '../presets/types';
import cancel from '../icons/cancel.svg?raw';
import './remove-button.style.scss';

export type RemoveButtonProps = {
  preset?: ClassPreset;
  onClick: (event: MouseEvent) => void;
  disabled?: boolean;
  rounded?: boolean;
  onMouseDown?: (event: MouseEvent) => void;
  onDblClick?: (event: MouseEvent) => void;
  className?: string;
  locale?: { title?: string; ariaLabel?: string };
  /** Compact hit area for an action embedded inside a selected-value chip. */
  compact?: boolean;
};

/** Neutral close/remove action for fields, chips, and other controls. */
export function RemoveButton({
  preset, onClick, disabled, rounded, onMouseDown, onDblClick,
  compact = false, className = '', locale = { title: 'Remove', ariaLabel: 'Remove' },
}: RemoveButtonProps) {
  return (
    <button
      onMouseDown={onMouseDown}
      onDblClick={onDblClick}
      onClick={onClick}
      disabled={disabled}
      type="button"
      data-part="root"
      title={locale.title}
      aria-label={locale.ariaLabel}
      className={`rounded-lg flex focus:outline-none remove-btn rv-chip-remove rv-remove-button${compact ? ' rv-remove-button--compact' : ''}${rounded ? ' rv-btn-rounded' : ''} ${className}${preset?.className ? ` ${preset.className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: cancel }}
    />
  );
}
