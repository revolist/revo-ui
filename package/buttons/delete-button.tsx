/** @jsxImportSource preact */
import type { ClassPreset } from '../presets/types';
import { h } from 'preact';

import cancel from '../icons/cancel.svg?raw';
import './delete-button.style.scss';
export const DeleteButton = ({
  preset,
  onClick,
  disabled,
  rounded,
  className,
  onMouseDown,
  onDblClick,
  locale = {
    title: 'Remove',
    ariaLabel: 'Remove',
  },
}: {
  preset?: ClassPreset;
  onClick: (e: MouseEvent) => void;
  disabled?: boolean;
  rounded?: boolean;
  onMouseDown?: (event: MouseEvent) => void;
  onDblClick?: (event: MouseEvent) => void;
  className?: string;
  locale?: {
    title?: string;
    ariaLabel?: string;
  };
}): any => (
  <button
    onMouseDown={onMouseDown}
    onDblClick={onDblClick}
    onClick={onClick}
    disabled={disabled}
    type="button"
    data-part="root"
    title={locale.title}
    aria-label={locale.ariaLabel}
    className={`rounded-lg flex focus:outline-none remove-btn rv-chip-remove${rounded ? ' rv-btn-rounded' : ''}${className ? ` ${className}` : ''}${preset?.className ? ` ${preset.className}` : ''}`}
    dangerouslySetInnerHTML={{ __html: cancel }}
  />
);
