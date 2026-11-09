/** @jsxImportSource preact */
import { h } from 'preact';
import { DeleteButton } from './delete-button';
import './remove-button.style.scss';

export type RemoveButtonProps = Parameters<typeof DeleteButton>[0] & {
  /** Compact hit area for an action embedded inside a selected-value chip. */
  compact?: boolean;
};

/** Neutral close/remove action; DeleteButton uses destructive action styling. */
export function RemoveButton({
  compact = false,
  className = '',
  ...props
}: RemoveButtonProps) {
  return (
    <DeleteButton
      {...props}
      className={`rv-remove-button${compact ? ' rv-remove-button--compact' : ''} ${className}`}
    />
  );
}
