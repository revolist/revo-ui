import { ButtonControl } from "../native-control";
import { h } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { selectionSettle } from "../core/settle-motion";
import {
  motionAllowed,
  presetAnimation,
  type MotionPreset,
} from "../presets/motion";

export type SwitchRenderable = any;

export type SwitchPreset = {
  motion?: MotionPreset;
  props?: { labelPosition?: "before" | "after" };
  className?: string;
  tokens?: {
    trackWidth?: string;
    trackHeight?: string;
    trackPadding?: string;
    thumbSize?: string;
    trackOff?: string;
    trackOn?: string;
    thumb?: string;
  };
};

export type SwitchProps = {
  preset?: SwitchPreset;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: SwitchRenderable;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  labelPosition?: "before" | "after";
  title?: string;
  testId?: string;
};

/** Shared compact binary control for Pro UI. */
export function Switch({
  preset,
  checked,
  onChange,
  label,
  ariaLabel,
  className = "",
  disabled = false,
  labelPosition,
  title,
  testId,
}: SwitchProps): any {
  const thumbRef = useRef<HTMLSpanElement>(null);
  const previousChecked = useRef(checked);
  useLayoutEffect(() => {
    const changed = previousChecked.current !== checked;
    previousChecked.current = checked;
    const thumb = thumbRef.current;
    const win = thumb?.ownerDocument.defaultView;
    if (
      !changed ||
      disabled ||
      !thumb ||
      !win ||
      typeof thumb.animate !== "function" ||
      !motionAllowed(thumb)
    )
      return;
    const configured = presetAnimation(preset?.motion, "settle", {
      keyframes: [
        { transform: "scaleX(1)" },
        {
          transform: `scaleX(${selectionSettle.scale})`,
          offset: selectionSettle.offset,
        },
        { transform: "scaleX(1)" },
      ],
      options: {
        duration: selectionSettle.duration,
        easing: selectionSettle.easing,
      },
    });
    if (!configured) return;
    const animation = thumb.animate(configured.keyframes, configured.options);
    void animation.finished.catch(() => {});
    return () => animation.cancel();
  }, [checked, disabled, preset?.motion]);
  const tokens = preset?.tokens;
  const presetStyle = tokens && {
    "--rv-ui-switch-preset-track-width": tokens.trackWidth,
    "--rv-ui-switch-preset-track-height": tokens.trackHeight,
    "--rv-ui-switch-preset-track-padding": tokens.trackPadding,
    "--rv-ui-switch-preset-thumb-size": tokens.thumbSize,
    "--rv-ui-switch-preset-track-off": tokens.trackOff,
    "--rv-ui-switch-preset-track-on": tokens.trackOn,
    "--rv-ui-switch-preset-thumb": tokens.thumb,
  };
  const position = labelPosition ?? preset?.props?.labelPosition ?? "before";
  const copy = (
    <span class="rv-switch-label" data-part="label">
      {label}
    </span>
  );
  const track = (
    <span class="rv-switch-track" data-part="track" aria-hidden="true">
      <span ref={thumbRef} class="rv-switch-thumb" data-part="thumb" />
    </span>
  );

  return (
    <ButtonControl
      type="button"
      class={["rv-switch", preset?.className, className]
        .filter(Boolean)
        .join(" ")}
      style={presetStyle}
      data-part="root"
      data-state={checked ? 'checked' : 'unchecked'}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
      disabled={disabled}
      title={title}
      data-testid={testId}
      onClick={() => onChange(!checked)}
    >
      {position === "before" ? copy : track}
      {position === "before" ? track : copy}
    </ButtonControl>
  );
}
