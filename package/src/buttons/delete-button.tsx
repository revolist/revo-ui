/** @jsxImportSource preact */
import { h } from 'preact';

import cancel from '../icons/cancel.svg?raw';
import './delete-button.style.scss';
export const DeleteButton = ({
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
    title={locale.title}
    aria-label={locale.ariaLabel}
    className={`rounded-lg flex focus:outline-none remove-btn rv-chip-remove${rounded ? ' rv-btn-rounded' : ''}${className ? ` ${className}` : ''}`}
    dangerouslySetInnerHTML={{ __html: cancel }}
  />
);
