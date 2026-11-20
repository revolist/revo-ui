import type { ClassPreset } from '../presets/types';
import { h } from 'preact';

/** Presentation for trusted, bundled SVG assets shared by plugin controls. */
export function SvgIcon({
  preset,
  svg,
  className = 'rv-svg-icon',
  size,
}: {
  preset?: ClassPreset;
  svg: string;
  className?: string;
  size?: number;
}) {
  return (
    <span
      class={[className, preset?.className].filter(Boolean).join(' ')}
      data-part="root"
      style={size === undefined ? undefined : { '--rv-icon-size': `${size}px` }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
