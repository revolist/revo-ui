import { h } from "preact";
import { useState } from "preact/hooks";
import { CollapsibleSection } from "@revolist/ui/preact";
import { themeToCss, type UiTheme } from "@revolist/ui/presets";
import { ThemeEditor, type ThemePreview } from "./theme-editor";
import { ThemeSamples } from "./theme-samples";
import { ColorsExamples } from "./colors";

/** A single workspace for creating portable component presets. */
export function CustomizePage() {
  const [preview, setPreview] = useState<ThemePreview>();
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const extraPreviews = preview ? selectedComponents
    .filter((name) => name !== preview.component)
    .map((component) => {
      const preset = {
        className: `rv-preview-${component.toLowerCase()}`,
        ...(component === "Button" ? { props: { variant: "primary" } } : {}),
        styles: { root: {
          "--rv-ui-accent": preview.preset.styles?.root?.["--rv-ui-accent"] ?? "#2563eb",
          "--rv-ui-radius": preview.preset.styles?.root?.["--rv-ui-radius"] ?? "6px",
          "--rv-ui-accent-hover": preview.preset.styles?.root?.["--rv-ui-accent-hover"] ?? "",
          "--rv-ui-accent-text": preview.preset.styles?.root?.["--rv-ui-accent-text"] ?? "",
          "--rv-ui-selected-bg": preview.preset.styles?.root?.["--rv-ui-selected-bg"] ?? "",
          "--rv-ui-selected-accent-fg": "var(--rv-ui-accent-text)",
          "--rv-ui-field-accent-text": "var(--rv-ui-accent-text)",
          "--rv-ui-badge-bg": "var(--rv-ui-accent)",
          "--rv-ui-focus-ring": preview.preset.styles?.root?.["--rv-ui-focus-ring"] ?? "",
        } },
      };
      const css = themeToCss({ version: 1, components: { [component]: { preview: preset } } } as UiTheme);
      return { component, preset, css };
    }) : [];
  return (
    <section class="customize-page" aria-labelledby="customize-title">
      <header class="customize-header">
        <span class="customize-eyebrow">YOUR DESIGN SYSTEM</span>
        <h1 id="customize-title">Make it yours.</h1>
        <p>
          Choose a component, shape its look and behavior, then take your preset
          to any project.
        </p>
      </header>
      <div class="customize-workspace">
        <div class="customize-settings">
          <div class="customize-section-heading">
            <div>
              <h2>Customize</h2>
              <p>Build a reusable preset</p>
            </div>
          </div>
          <ThemeEditor standalone onPreview={setPreview} onComponentsChange={setSelectedComponents} />
        </div>
        <div class="customize-preview">
          <div class="customize-section-heading">
            <div>
              <h2>Live preview</h2>
              <p>See your changes as you make them</p>
            </div>
          </div>
          {preview && <style>{preview.css}</style>}
          {preview ? (
            <div class="customize-preview-samples">
              {extraPreviews.map((sample) => (
                <section key={sample.component} aria-label={`${sample.component} preview`}>
                  <h3>{sample.component}</h3>
                  <style>{sample.css}</style>
                  <ThemeSamples preview={sample} />
                </section>
              ))}
              <section aria-label={`${preview.component} preview`}>
                <h3>{preview.component}</h3>
                <ThemeSamples preview={preview} />
              </section>
            </div>
          ) : (
            <p>Choose a component to start previewing.</p>
          )}
        </div>
      </div>
      <CollapsibleSection
        className="customize-color-reference"
        title="Explore semantic colors and palettes"
      >
        <section id="colors" aria-label="Color reference">
          <ColorsExamples />
        </section>
      </CollapsibleSection>
    </section>
  );
}
