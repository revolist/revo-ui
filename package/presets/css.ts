import type { UiTheme } from './index';

/** CSS declarations on a component root and its documented data-part elements. */
export interface PresetStyles {
  root?: Record<string, string>;
  parts?: Record<string, Record<string, string>>;
}

const classPattern = /^-?[_a-zA-Z][_a-zA-Z0-9-]*$/;
const partPattern = /^[a-z][a-z0-9-]*$/;
const propertyPattern = /^(?:--[a-zA-Z0-9_-]+|[a-z][a-z0-9-]*)$/;
const valuePattern = /^[^;{}\\\r\n]*$/;

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
        typeof value !== 'string' ||
        !valuePattern.test(value) ||
        value.includes('/*') ||
        value.includes('*/')
      )
        throw new TypeError(`Invalid CSS declaration: ${property}`);
      return `  ${property}: ${value};`;
    });
    if (lines.length) rules.push(`${selector} {\n${lines.join('\n')}\n}`);
  };
  for (const presets of Object.values(theme.components)) {
    if (!presets) continue;
    for (const preset of Object.values(presets) as Array<{
      className?: string;
      styles?: PresetStyles;
    }>) {
      if (!preset.styles) continue;
      if (!preset.className || !classPattern.test(preset.className))
        throw new TypeError(
          'Structured styles require one valid CSS class name',
        );
      const selector = `.${preset.className}`;
      if (preset.styles.root) emit(selector, preset.styles.root);
      for (const [part, declarations] of Object.entries(
        preset.styles.parts ?? {},
      )) {
        if (!partPattern.test(part))
          throw new TypeError(`Invalid CSS part: ${part}`);
        const attribute = `[data-part="${part}"]`;
        // A descendant component's root starts a new part scope. The root
        // itself is addressed only on the preset element, not its children.
        const scopedPart = part === 'root'
          ? `${selector}${attribute}`
          : `${selector}${attribute}, ${selector} ${attribute}:not(:where(${selector} [data-part="root"]:not(${selector}):not([data-preset-scope="inherit"]) *))`;
        emit(scopedPart, declarations);
      }
    }
  }
  return rules.length ? `${rules.join('\n\n')}\n` : '';
}
