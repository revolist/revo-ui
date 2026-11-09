import { h } from 'preact';

/** Presentation for trusted, bundled SVG assets shared by plugin controls. */
export function SvgIcon({
  svg,
  className = 'rv-svg-icon',
  size,
}: {
  svg: string;
  className?: string;
  size?: number;
}) {
  return (
    <span
      class={className}
      style={size === undefined ? undefined : { '--rv-icon-size': `${size}px` }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
