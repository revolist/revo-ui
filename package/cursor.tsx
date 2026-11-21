import arrowPointer from '@fortawesome/fontawesome-free/svgs/solid/arrow-pointer.svg?raw';
import { Fragment, h, type ComponentChildren, type JSX } from 'preact';
import { SvgIcon } from './icons';
import type { ClassPreset } from './presets/types';

export interface CursorPosition {
  /** Horizontal offset in CSS pixels from the left of the containing surface. */
  x: number;
  /** Vertical offset in CSS pixels from the top of the containing surface. */
  y: number;
}

export interface CursorProps {
  /** Position in a containing surface established by the host. Omit to lay out inline. */
  position?: CursorPosition;
  /** Any CSS color. Defaults to the theme accent. */
  color?: string;
  /** Collaborator name for the default label. */
  name?: string;
  /** Optional localized message for the default label. */
  message?: string;
  /** Animate updates to the provided position using the theme motion settings. */
  animate?: boolean;
  /** Custom cursor parts. Omit to use the shared default pointer and label. */
  children?: ComponentChildren;
  /** Hide the cursor from assistive technology when presence is already listed elsewhere. */
  'aria-hidden'?: JSX.AriaAttributes['aria-hidden'];
  /** Additional CSS styling, including caller-managed coordinates when position is omitted. */
  style?: JSX.CSSProperties;
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional root class names. */
  className?: string;
}

export interface CursorPartProps {
  /** Optional presentation preset. */
  preset?: ClassPreset;
  /** Additional part class names. */
  className?: string;
}

export interface CursorPointerProps extends CursorPartProps {
  /** Pointer size in CSS pixels. */
  size?: number;
  /** Optional trusted SVG markup. */
  icon?: string;
}

export interface CursorLabelProps extends CursorPartProps {
  /** Display content supplied by the host. */
  children?: ComponentChildren;
}

/** A passive collaborator pointer with optional name and message. */
export function Cursor({
  position,
  color,
  name,
  message,
  animate = false,
  children,
  style,
  preset,
  className = '',
  'aria-hidden': ariaHidden,
}: CursorProps) {
  const positioned =
    position && Number.isFinite(position.x) && Number.isFinite(position.y);

  return (
    <span
      class={`rv-cursor ${preset?.className ?? ''} ${className}`.trim()}
      data-part="root"
      data-positioned={positioned ? '' : undefined}
      data-animated={positioned && animate ? '' : undefined}
      aria-hidden={ariaHidden}
      style={{
        ...style,
        '--rv-cursor-color': color,
        '--rv-cursor-x': positioned ? `${position.x}px` : undefined,
        '--rv-cursor-y': positioned ? `${position.y}px` : undefined,
      }}
    >
      {children ?? (
        <>
          <CursorPointer />
          {(name || message) && (
            <CursorBody>
              {name && <CursorName>{name}</CursorName>}
              {message && <CursorMessage>{message}</CursorMessage>}
            </CursorBody>
          )}
        </>
      )}
    </span>
  );
}

export function CursorPointer({
  preset,
  className = '',
  size = 18,
  icon = arrowPointer,
}: CursorPointerProps) {
  return (
    <span
      data-part="pointer"
      class={`rv-cursor-pointer ${preset?.className ?? ''} ${className}`.trim()}
      aria-hidden="true"
    >
      <SvgIcon svg={icon} size={size} />
    </span>
  );
}

export function CursorBody({
  children,
  preset,
  className = '',
}: CursorLabelProps) {
  return (
    <span
      data-part="body"
      class={`rv-cursor-body ${preset?.className ?? ''} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

export function CursorName({
  children,
  preset,
  className = '',
}: CursorLabelProps) {
  return (
    <span
      dir="auto"
      data-part="name"
      class={`rv-cursor-name ${preset?.className ?? ''} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

export function CursorMessage({
  children,
  preset,
  className = '',
}: CursorLabelProps) {
  return (
    <span
      dir="auto"
      data-part="message"
      class={`rv-cursor-message ${preset?.className ?? ''} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
