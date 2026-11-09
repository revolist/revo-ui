/** @jsxImportSource preact */
import { h } from 'preact';
import { ButtonControl as UiButton } from '../native-control';

import { useControlTooltip } from '../core/tooltip';
import { SvgIcon } from '../icons/icon';
const FormatIcon = ({ icon }: { icon: string }) => (
  <SvgIcon svg={icon} className="rv-format-icon" />
);

export interface SegmentedOption<Value extends string> {
  readonly value: Value;
  readonly label: string;
  readonly icon: string;
}

export function IconChoiceGroup<Value extends string>({
  value,
  options,
  ariaLabel,
  onChange,
}: {
  readonly value: Value;
  readonly options: readonly SegmentedOption<Value>[];
  readonly ariaLabel: string;
  readonly onChange: (value: Value) => void;
}) {
  return (
    <div class="rv-format-segmented" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <SegmentedButton
          key={option.value}
          selected={option.value === value}
          label={option.label}
          icon={option.icon}
          onClick={() => onChange(option.value)}
        />
      ))}
    </div>
  );
}

export function IconToggleButton({
  value,
  label,
  icon,
  onChange,
}: {
  readonly value: boolean;
  readonly label: string;
  readonly icon: string;
  readonly onChange: (value: boolean) => void;
}) {
  return (
    <SegmentedButton
      selected={value}
      label={label}
      icon={icon}
      onClick={() => onChange(!value)}
    />
  );
}

function SegmentedButton({
  selected,
  label,
  icon,
  onClick,
}: {
  readonly selected: boolean;
  readonly label: string;
  readonly icon: string;
  readonly onClick: () => void;
}) {
  const tooltip = useControlTooltip(label, true);
  return (
    <UiButton
      type="button"
      class={`rv-format-segmented__button${selected ? ' rv-format-segmented__button--selected' : ''}`}
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      {...tooltip.triggerProps}
    >
      <FormatIcon icon={icon} />
      {tooltip.tooltip}
    </UiButton>
  );
}
