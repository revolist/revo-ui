import { h } from 'preact';
import { useState } from 'preact/hooks';
import { createPreactElement, releasePreactElement } from '../preact-mount';
import { ColorPicker } from './color-picker';

export interface NativeColorPickerProps {
  label: string;
  value?: string;
  disabled?: boolean;
  optional?: boolean;
  defaultLabel: string;
  customLabel: string;
  invalidColor?: string;
  colorLabels: Readonly<Record<string, string>>;
  onChange(value: string | undefined): void;
}

function MountedColorPicker(props: NativeColorPickerProps) {
  const [value, setValue] = useState(props.value);
  return (
    <ColorPicker
      {...props}
      value={value}
      customHexLabel={props.customLabel}
      onChange={(next) => {
        setValue(next);
        props.onChange(next);
      }}
    />
  );
}

/** Native mount API; palette markup and interaction belong to ColorPicker. */
export function mountColorPicker(
  host: HTMLElement,
  props: NativeColorPickerProps,
) {
  const root = createPreactElement(
    host.ownerDocument,
    <MountedColorPicker {...props} />,
  );
  host.append(root);
  return {
    destroy() {
      releasePreactElement(root);
    },
  };
}
