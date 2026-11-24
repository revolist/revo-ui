import { h } from 'preact';
import { Switch } from './switch/index';
import { ButtonControl } from './native-control';
import { Dropdown } from './dropdown';

export interface AppearanceConfiguratorLabels {
  appearance: string;
  density: string;
  columnLines: string;
  rowStripes: string;
  columns: string;
  resizable: string;
  movable: string;
  reset: string;
}
export interface AppearanceConfiguratorState {
  density: string;
  columnLines: boolean;
  rowStripes: boolean;
  resizable: boolean;
  movable: boolean;
}
export interface AppearanceConfiguratorProps {
  labels: AppearanceConfiguratorLabels;
  densityOptions: readonly { value: string; label: string }[];
  state: AppearanceConfiguratorState;
  onChange: (patch: Partial<AppearanceConfiguratorState>) => void;
  onReset: () => void;
}
/** Controlled, localizable appearance controls for a grid host. */
export function AppearanceConfigurator({
  labels,
  densityOptions,
  state,
  onChange,
  onReset,
}: AppearanceConfiguratorProps) {
  return (
    <div class="rv-appearance-configurator">
      <strong class="rv-appearance-configurator__heading">
        {labels.appearance}
      </strong>
      <div class="rv-appearance-configurator__density">
        <span>{labels.density}</span>
        <Dropdown
          source={densityOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          value={state.density}
          config={{
            ariaLabel: labels.density,
            nativeTabNavigation: true,
            topLayer: true,
          }}
          onChange={(value) => onChange({ density: String(value) })}
        />
      </div>
      <Switch
        label={labels.columnLines}
        checked={state.columnLines}
        onChange={(columnLines) => onChange({ columnLines })}
      />
      <Switch
        label={labels.rowStripes}
        checked={state.rowStripes}
        onChange={(rowStripes) => onChange({ rowStripes })}
      />
      <div class="rv-appearance-configurator__separator" />
      <strong class="rv-appearance-configurator__heading">
        {labels.columns}
      </strong>
      <Switch
        label={labels.resizable}
        checked={state.resizable}
        onChange={(resizable) => onChange({ resizable })}
      />
      <Switch
        label={labels.movable}
        checked={state.movable}
        onChange={(movable) => onChange({ movable })}
      />
      <div class="rv-appearance-configurator__separator" />
      <ButtonControl
        type="button"
        class="rv-appearance-configurator__reset"
        onClick={onReset}
      >
        ↶ {labels.reset}
      </ButtonControl>
    </div>
  );
}
