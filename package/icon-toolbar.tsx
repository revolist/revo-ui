/** @jsxImportSource preact */
import { useTitleTooltip } from './core/title-tooltip';
import { h, type Ref } from 'preact';
import plus from '@fortawesome/fontawesome-free/svgs/solid/plus.svg?raw';
import minus from '@fortawesome/fontawesome-free/svgs/solid/minus.svg?raw';
import arrowLeft from '@fortawesome/fontawesome-free/svgs/solid/arrow-left.svg?raw';
import arrowRight from '@fortawesome/fontawesome-free/svgs/solid/arrow-right.svg?raw';
import arrowUp from '@fortawesome/fontawesome-free/svgs/solid/arrow-up.svg?raw';
import arrowDown from '@fortawesome/fontawesome-free/svgs/solid/arrow-down.svg?raw';
import reset from '@fortawesome/fontawesome-free/svgs/solid/rotate-left.svg?raw';

/** Bundled SVG assets; independent of font coverage and platform glyph metrics. */
export const ICON_TOOLBAR_ICONS = {
  plus,
  minus,
  arrowLeft,
  arrowRight,
  arrowUp,
  arrowDown,
  reset,
} as const;

/** Inline SVG styles remain portable when a consumer exports its document. */
export const SVG_TOOLBAR_BUTTON_STYLES = `
  .rv-svg-toolbar-button { cursor: pointer; }
  .rv-svg-toolbar-button[aria-pressed="true"] > rect { fill: currentColor; fill-opacity: .14; }
  .rv-svg-toolbar-button[aria-disabled="true"] { opacity: .4; cursor: default; }
  .rv-svg-toolbar-button:not([aria-disabled="true"]):hover > rect { fill: currentColor; fill-opacity: .1; }
  .rv-svg-toolbar-button:focus-visible { outline: none; }
  .rv-svg-toolbar-button:focus-visible > rect { stroke: currentColor; stroke-width: 2; }
`;

export interface SvgToolbarButtonProps {
  action: string;
  label: string;
  title?: string;
  text?: string;
  /** Trusted bundled SVG markup, as accepted by the shared SvgIcon component. */
  icon?: string;
  suffixIcon?: string;
  pressed?: boolean;
  enabled: boolean;
  x: number;
  y: number;
  foreground?: string;
  /** Keep a custom text caption visible, retaining the SVG icon as a fallback. */
  showText?: boolean;
  attributes?: { [attribute: `data-${string}`]: string };
  onRectangle?: (element: SVGRectElement) => void;
  onText?: (element: SVGTextElement) => void;
  onActivate?: (action: string) => void;
  onEscape?: () => void;
}

/** Shared SVG icon-button presentation; the consumer owns each action. */
export function SvgToolbarButton(props: SvgToolbarButtonProps) {
  const tooltip = useTitleTooltip<SVGGElement>(
    props.title ?? props.label,
    props.onEscape,
  );
  return <SvgToolbarButtonView {...props} buttonRef={tooltip} />;
}

/** SVG presentation for hosts that own the button lifecycle. */
export function SvgToolbarButtonView(
  props: SvgToolbarButtonProps & { buttonRef?: Ref<SVGGElement> },
) {
  return (
    <g
      ref={props.buttonRef}
      {...props.attributes}
      class="rv-svg-toolbar-button"
      role="button"
      tabindex={props.enabled ? 0 : -1}
      aria-label={props.label}
      aria-disabled={!props.enabled}
      aria-pressed={props.pressed}
      data-rv-svg-toolbar-button={props.action}
      onClick={
        props.onActivate
          ? () => {
              if (props.enabled) props.onActivate?.(props.action);
            }
          : undefined
      }
      onKeyDown={
        props.onActivate
          ? (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return;
              event.preventDefault();
              event.stopPropagation();
              if (props.enabled) props.onActivate?.(props.action);
            }
          : undefined
      }
    >
      <rect
        ref={(element) => {
          if (element) props.onRectangle?.(element);
        }}
        x={props.x}
        y={props.y}
        width={28}
        height={28}
        rx={6}
        fill="transparent"
        stroke="transparent"
      />
      {props.icon && (
        <svg
          data-rv-toolbar-icon=""
          x={props.x + (props.suffixIcon ? 5 : 8)}
          y={props.y + 8}
          width={12}
          height={12}
          visibility={props.showText ? 'hidden' : undefined}
          aria-hidden="true"
          focusable="false"
          fill="currentColor"
          style={{
            color:
              props.foreground ??
              (props.pressed
                ? 'var(--rv-ui-accent-text, Highlight)'
                : 'var(--rv-ui-text, CanvasText)'),
          }}
          dangerouslySetInnerHTML={{ __html: props.icon }}
        />
      )}
      {props.suffixIcon && (
        <svg
          x={props.x + 18}
          y={props.y + 12}
          width={6}
          height={8}
          aria-hidden="true"
          focusable="false"
          fill="currentColor"
          style={{
            color:
              props.foreground ??
              (props.pressed
                ? 'var(--rv-ui-accent-text, Highlight)'
                : 'var(--rv-ui-text, CanvasText)'),
          }}
          dangerouslySetInnerHTML={{ __html: props.suffixIcon }}
        />
      )}
      <text
        visibility={props.icon && !props.showText ? 'hidden' : undefined}
        ref={(element) => {
          if (element) props.onText?.(element);
        }}
        x={props.x + 14}
        y={props.y + 19}
        fill={props.foreground ?? 'var(--rv-ui-text, currentColor)'}
        font-size={16}
        text-anchor="middle"
        aria-hidden="true"
      >
        {props.text}
      </text>
    </g>
  );
}

export interface IconToolbarAction {
  id: string;
  label: string;
  title?: string;
  text?: string;
  /** Trusted bundled SVG markup, as accepted by the shared SvgIcon component. */
  icon?: string;
  suffixIcon?: string;
  pressed?: boolean;
  disabled?: boolean;
}
export interface IconToolbarProps {
  actions: readonly IconToolbarAction[];
  label?: string;
  onAction: (action: string) => void;
  /** Restore the owning composite focus when Escape dismisses an action tooltip. */
  onEscape?: () => void;
}
/** Compact SVG icon toolbar; the consumer supplies icons, labels and actions. */
export function IconToolbar({
  actions,
  label = 'Actions',
  onAction,
  onEscape,
}: IconToolbarProps) {
  const width = Math.max(10, actions.length * 33 + 5);
  return (
    <svg
      class="rv-icon-toolbar"
      role="group"
      aria-label={label}
      width={width}
      height={38}
      viewBox={`0 0 ${width} 38`}
      style={{ color: 'var(--rv-ui-accent, Highlight)', maxWidth: '100%' }}
    >
      <style>{SVG_TOOLBAR_BUTTON_STYLES}</style>
      <rect
        width={width}
        height={38}
        rx={12}
        fill="var(--rv-ui-surface-sunken, transparent)"
      />
      {actions.map((action, index) => (
        <SvgToolbarButton
          key={action.id}
          action={action.id}
          label={action.label}
          title={action.title}
          text={action.text}
          icon={action.icon}
          suffixIcon={action.suffixIcon}
          pressed={action.pressed}
          enabled={!action.disabled}
          x={5 + index * 33}
          y={5}
          onActivate={onAction}
          onEscape={onEscape}
        />
      ))}
    </svg>
  );
}
