/** JSON-compatible Web Animations configuration for a named component event. */
export type MotionFrame = Record<string, string | number>;
export interface MotionEvent {
  enabled?: boolean;
  duration?: number;
  delay?: number;
  endDelay?: number;
  easing?: string;
  iterations?: number;
  iterationStart?: number;
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  fill?: "none" | "forwards" | "backwards" | "both" | "auto";
  /** Additional delay per calendar column, in milliseconds. */
  stagger?: number;
  keyframes?: MotionFrame[];
}
export type MotionPreset = Record<string, MotionEvent>;

/** Accessibility and explicit motion-off settings take precedence over presets. */
export function motionAllowed(element: HTMLElement): boolean {
  const win = element.ownerDocument.defaultView;
  return Boolean(
    win &&
    !element.closest('[data-rv-ui-motion="off"]') &&
    !win.matchMedia?.("(prefers-reduced-motion: reduce)").matches &&
    parseFloat(
      win.getComputedStyle(element).getPropertyValue("--rv-ui-motion-normal"),
    ) !== 0,
  );
}

/** Validate portable data before storing or previewing a preset. */
export function validateMotionPreset(
  value: unknown,
): asserts value is MotionPreset {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new TypeError("Motion must be an object");
  for (const [name, event] of Object.entries(value)) {
    if (
      !/^[a-z][a-zA-Z0-9]*$/.test(name) ||
      !event ||
      typeof event !== "object" ||
      Array.isArray(event)
    )
      throw new TypeError("Invalid motion event");
    for (const [key, entry] of Object.entries(event)) {
      if (key === "enabled" && typeof entry === "boolean") continue;
      if (
        ["duration", "stagger", "iterations", "iterationStart"].includes(key) &&
        typeof entry === "number" &&
        Number.isFinite(entry) &&
        entry >= 0
      )
        continue;
      if (
        ["delay", "endDelay"].includes(key) &&
        typeof entry === "number" &&
        Number.isFinite(entry)
      )
        continue;
      if (
        key === "direction" &&
        ["normal", "reverse", "alternate", "alternate-reverse"].includes(
          String(entry),
        )
      )
        continue;
      if (
        key === "fill" &&
        ["none", "forwards", "backwards", "both", "auto"].includes(
          String(entry),
        )
      )
        continue;
      if (
        key === "easing" &&
        typeof entry === "string" &&
        entry.length > 0 &&
        entry.length <= 200 &&
        (typeof CSS === "undefined" ||
          CSS.supports("animation-timing-function", entry))
      )
        continue;
      if (
        key === "keyframes" &&
        Array.isArray(entry) &&
        entry.length >= 2 &&
        entry.every(
          (frame) =>
            frame &&
            typeof frame === "object" &&
            !Array.isArray(frame) &&
            Object.entries(frame).every(
              ([property, v]) =>
                /^[a-zA-Z][a-zA-Z0-9]*$/.test(property) &&
                (property === "offset"
                  ? typeof v === "number" &&
                    Number.isFinite(v) &&
                    v >= 0 &&
                    v <= 1
                  : typeof v === "string" ||
                    (typeof v === "number" && Number.isFinite(v))),
            ),
        )
      ) {
        let lastOffset = -1;
        for (const frame of entry) {
          if (frame.offset !== undefined) {
            if (frame.offset < lastOffset)
              throw new TypeError("Keyframe offsets must be ordered");
            lastOffset = frame.offset;
          }
          if (
            frame.easing !== undefined &&
            (typeof frame.easing !== "string" ||
              (typeof CSS !== "undefined" &&
                !CSS.supports("animation-timing-function", frame.easing)))
          )
            throw new TypeError("Invalid keyframe easing");
        }
        continue;
      }
      throw new TypeError(`Invalid motion setting: ${key}`);
    }
  }
}

/** Merge an optional event override with component-owned defaults. */
export function presetAnimation(
  preset: MotionPreset | undefined,
  event: string,
  defaults: { keyframes: Keyframe[]; options: KeyframeAnimationOptions },
  variables: Record<string, string | number> = {},
):
  | {
      keyframes: Keyframe[];
      options: KeyframeAnimationOptions;
      stagger?: number;
    }
  | undefined {
  const entry = preset?.[event];
  if (entry?.enabled === false) return;
  const keyframes = entry?.keyframes?.map((frame) =>
    Object.fromEntries(
      Object.entries(frame).map(([key, value]) => [
        key,
        typeof value === "string"
          ? value.replace(/\{\{([a-zA-Z]+)\}\}/g, (token, name: string) =>
              String(variables[name] ?? token),
            )
          : value,
      ]),
    ),
  ) as Keyframe[] | undefined;
  return {
    keyframes: keyframes ?? defaults.keyframes,
    options: {
      ...defaults.options,
      ...(entry?.duration !== undefined ? { duration: entry.duration } : {}),
      ...(entry?.delay !== undefined ? { delay: entry.delay } : {}),
      ...(entry?.endDelay !== undefined ? { endDelay: entry.endDelay } : {}),
      ...(entry?.easing !== undefined ? { easing: entry.easing } : {}),
      ...(entry?.iterations !== undefined
        ? { iterations: entry.iterations }
        : {}),
      ...(entry?.iterationStart !== undefined
        ? { iterationStart: entry.iterationStart }
        : {}),
      ...(entry?.direction !== undefined ? { direction: entry.direction } : {}),
      ...(entry?.fill !== undefined ? { fill: entry.fill } : {}),
    },
    stagger: entry?.stagger,
  };
}
