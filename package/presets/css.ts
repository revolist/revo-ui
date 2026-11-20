import type { UiTheme } from "./index";
import {
  validateMotionPreset,
  type MotionEvent,
  type MotionPreset,
} from "./motion";

/** CSS declarations on a component root and its documented data-part elements. */
export interface PresetStyles {
  root?: Record<string, string>;
  parts?: Record<string, Record<string, string>>;
}

const classPattern = /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/;
const partPattern = /^[a-z][a-z0-9-]*$/;
const propertyPattern = /^(?:--[a-zA-Z0-9_-]+|[a-z][a-z0-9-]*)$/;
const valuePattern = /^[^;{}\\\r\n]*$/;

const sliderComponents = new Set([
  "SingleValueSlider",
  "SliderField",
  "PreactRangeSlider",
  "RangeSlider",
]);

function sliderMotionCss(className: string, motion: MotionPreset): string[] {
  validateMotionPreset(motion);
  const result: string[] = [];
  for (const event of ["hover", "press"] as const) {
    const config: MotionEvent | undefined = motion[event];
    if (!config) continue;
    if (
      config.endDelay !== undefined ||
      config.iterationStart !== undefined ||
      config.stagger !== undefined
    )
      throw new TypeError(
        `Slider ${event} does not support endDelay, iterationStart, or stagger`,
      );
    const frames = config.keyframes ?? [
      { transform: "scale(1)" },
      { transform: event === "hover" ? "scale(1.1)" : "scale(0.92)" },
    ];
    const name = `rv-motion-${className}-${event}`;
    const selectors = ["webkit-slider-thumb", "moz-range-thumb"].map(
      (pseudo) =>
        `.${className}.rv-single-slider:not(:disabled)::-` +
        pseudo +
        (event === "hover" ? ":hover" : ":active") +
        `, .${className} input[type="range"]:not(:disabled)::-` +
        pseudo +
        (event === "hover" ? ":hover" : ":active"),
    );
    if (config.enabled !== false) {
      const lines = frames.map((frame, index) => {
        const offset =
          frame.offset === undefined
            ? index / (frames.length - 1)
            : frame.offset;
        if (typeof offset !== "number" || offset < 0 || offset > 1)
          throw new TypeError("Invalid keyframe offset");
        const declarations = Object.entries(frame)
          .filter(([property]) => property !== "offset")
          .map(([property, value]) => {
            const cssProperty = property.replace(
              /[A-Z]/g,
              (letter) => `-${letter.toLowerCase()}`,
            );
            const cssValue = String(value);
            if (
              !propertyPattern.test(cssProperty) ||
              !valuePattern.test(cssValue) ||
              cssValue.includes("/*") ||
              cssValue.includes("*/")
            )
              throw new TypeError(`Invalid keyframe declaration: ${property}`);
            return `    ${cssProperty === "easing" ? "animation-timing-function" : cssProperty}: ${cssValue};`;
          });
        return `  ${offset * 100}% {\n${declarations.join("\n")}\n  }`;
      });
      result.push(`@keyframes ${name} {\n${lines.join("\n")}\n}`);
    }
    const easing = config.easing ?? "ease";
    if (
      !valuePattern.test(easing) ||
      easing.includes("/*") ||
      easing.includes("*/")
    )
      throw new TypeError("Invalid animation easing");
    const declaration =
      config.enabled === false
        ? "animation: none; transform: none;"
        : `animation: ${name} ${config.duration ?? 120}ms ${easing} ${config.delay ?? 0}ms ${config.iterations ?? 1} ${config.direction ?? "normal"} ${config.fill ?? "both"};`;
    const rules = selectors
      .map((selector) => `${selector} { ${declaration} }`)
      .join("\n");
    result.push(
      event === "hover" ? `@media (hover: hover) {\n${rules}\n}` : rules,
    );
    result.push(
      `@media (prefers-reduced-motion: reduce) {\n${selectors.map((selector) => `${selector} { animation: none !important; transform: none !important; }`).join("\n")}\n}`,
    );
    result.push(
      selectors
        .map(
          (selector) =>
            `[data-rv-ui-motion="off"] ${selector.replace(", ", ', [data-rv-ui-motion="off"] ')} { animation: none !important; transform: none !important; }`,
        )
        .join("\n"),
    );
  }
  return result;
}

/**
 * Compile structured theme styles into CSS for an application to write or import.
 * The function returns text and does not mutate the document. Use a CSS file for
 * selectors or values that do not fit this intentionally small portable format.
 */
export function themeToCss(theme: UiTheme): string {
  const rules: string[] = [];
  const emit = (selector: string, declarations: Record<string, string>) => {
    const lines = Object.entries(declarations).map(([property, value]) => {
      if (
        !propertyPattern.test(property) ||
        typeof value !== "string" ||
        !valuePattern.test(value) ||
        value.includes("/*") ||
        value.includes("*/")
      )
        throw new TypeError(`Invalid CSS declaration: ${property}`);
      return `  ${property}: ${value};`;
    });
    if (lines.length) rules.push(`${selector} {\n${lines.join("\n")}\n}`);
  };
  for (const [component, presets] of Object.entries(theme.components)) {
    if (!presets) continue;
    for (const preset of Object.values(presets) as Array<{
      className?: string;
      styles?: PresetStyles;
      motion?: MotionPreset;
    }>) {
      if (!preset.styles && !(sliderComponents.has(component) && preset.motion))
        continue;
      if (!preset.className || !classPattern.test(preset.className))
        throw new TypeError(
          "Structured styles require one valid CSS class name",
        );
      const selector = `.${preset.className}`;
      if (sliderComponents.has(component) && preset.motion)
        rules.push(...sliderMotionCss(preset.className, preset.motion));
      if (!preset.styles) continue;
      const rootSelector = `${selector}:not([data-preset-surface])`;
      if (preset.styles.root) {
        const entries = Object.entries(preset.styles.root);
        emit(selector, Object.fromEntries(entries.filter(([name]) => name.startsWith('--'))));
        emit(rootSelector, Object.fromEntries(entries.filter(([name]) => !name.startsWith('--'))));
      }
      for (const [part, declarations] of Object.entries(
        preset.styles.parts ?? {},
      )) {
        if (!partPattern.test(part))
          throw new TypeError(`Invalid CSS part: ${part}`);
        const attribute = `[data-part="${part}"]`;
        // A descendant component's root starts a new part scope. The root
        // itself is addressed only on the preset element, not its children.
        const scopedPart = part === 'root'
          ? rootSelector
          : `${selector}${attribute}, ${selector} ${attribute}:not([data-preset-scope="root"]):not(:where(${selector} :is([data-part="root"], [data-preset-scope="root"]):not(${selector}):not([data-preset-scope="inherit"]) *))`;
        emit(scopedPart, declarations);
      }
    }
  }
  return rules.length ? `${rules.join("\n\n")}\n` : "";
}
