import { ButtonControl } from '../native-control';
import { h } from 'preact';

export type SwitchRenderable = any;

export type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: SwitchRenderable;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  labelPosition?: 'before' | 'after';
  title?: string;
  testId?: string;
};

/** Shared compact binary control for Pro UI. */
export function Switch({
  checked,
  onChange,
  label,
  ariaLabel,
  className = '',
  disabled = false,
  labelPosition = 'before',
  title,
  testId,
}: SwitchProps): any {
  const copy = <span class="rv-switch-label">{label}</span>;
  const track = (
    <span class="rv-switch-track" aria-hidden="true">
      <span class="rv-switch-thumb" />
    </span>
  );

  return (
    <ButtonControl
      type="button"
      class={`rv-switch ${className}`.trim()}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
      disabled={disabled}
      title={title}
      data-testid={testId}
      onClick={() => onChange(!checked)}
    >
      {labelPosition === 'before' ? copy : track}
      {labelPosition === 'before' ? track : copy}
    </ButtonControl>
  );
}
