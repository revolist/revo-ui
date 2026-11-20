import { h } from 'preact';
import { Switch } from '@revolist/ui/preact';
import { siteHref } from './routing';

export type GalleryStyle =
  | 'standard'
  | 'compact'
  | 'sharp'
  | 'soft'
  | 'raised'
  | 'glass';
export type GalleryTheme = {
  accent?: string;
  radius?: number;
  style?: GalleryStyle;
};
export const galleryStyles: ReadonlyArray<{
  id: GalleryStyle;
  label: string;
  radius?: number;
}> = [
  { id: 'standard', label: 'Standard' },
  { id: 'compact', label: 'Compact', radius: 4 },
  { id: 'sharp', label: 'Sharp', radius: 0 },
  { id: 'soft', label: 'Soft', radius: 12 },
  { id: 'raised', label: 'Raised', radius: 8 },
  { id: 'glass', label: 'Glass', radius: 12 },
];
const storageKey = 'revo-ui-gallery-global-theme-v1';
export const accents = [
  ['Violet', '#6d28d9'],
  ['Blue', '#2563eb'],
  ['Cyan', '#0891b2'],
  ['Green', '#059669'],
  ['Lime', '#65a30d'],
  ['Amber', '#d97706'],
  ['Red', '#dc2626'],
  ['Pink', '#db2777'],
] as const;

export function readGalleryTheme(): GalleryTheme {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? '{}');
    return {
      accent: accents.some(([, hex]) => hex === value.accent)
        ? value.accent
        : undefined,
      radius: [0, 4, 8, 12, 16].includes(value.radius)
        ? value.radius
        : undefined,
      style: galleryStyles.some((style) => style.id === value.style)
        ? value.style
        : undefined,
    };
  } catch {
    return {};
  }
}
export function saveGalleryTheme(value: GalleryTheme) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    /* Preview still works without storage. */
  }
}
export function GlobalThemePanel({
  value,
  onChange,
  motion,
  onMotionChange,
  rtl,
  onRtlChange,
}: {
  value: GalleryTheme;
  onChange: (value: GalleryTheme) => void;
  motion: boolean;
  onMotionChange: (value: boolean) => void;
  rtl: boolean;
  onRtlChange: (value: boolean) => void;
}) {
  return (
    <section
      class="global-theme-panel"
      id="global-theme-panel"
      aria-label="Customize gallery theme"
    >
      <div class="global-theme-inner">
        <div class="global-theme-intro">
          <span>YOUR DESIGN SYSTEM</span>
          <h2>Customize your view</h2>
          <p>Preview shared colors and corners across the gallery.</p>
        </div>
        <fieldset>
          <legend>Accent color</legend>
          <div class="global-theme-colors">
            {accents.map(([name, color]) => (
              <button
                type="button"
                key={name}
                class="theme-editor-swatch"
                style={{ background: color }}
                aria-label={name}
                aria-pressed={value.accent === color}
                onClick={() => onChange({ ...value, accent: color })}
              />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Corner radius</legend>
          <div class="global-theme-radii">
            {[0, 4, 8, 12, 16].map((radius) => (
              <button
                type="button"
                key={radius}
                aria-label={`Radius ${radius}px`}
                aria-pressed={value.radius === radius}
                onClick={() => onChange({ ...value, radius })}
              >
                <span style={{ borderRadius: `${radius}px` }} />
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Style</legend>
          <div class="global-theme-styles">
            {galleryStyles.map((style) => (
              <button
                type="button"
                key={style.id}
                aria-pressed={(value.style ?? 'standard') === style.id}
                onClick={() =>
                  onChange({ ...value, style: style.id, radius: style.radius })
                }
              >
                {style.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div
          class="global-theme-preferences"
          role="group"
          aria-label="Display preferences"
        >
          <Switch
            label="Animations"
            checked={motion}
            onChange={onMotionChange}
          />
          <Switch label="Right to left" checked={rtl} onChange={onRtlChange} />
          <a href={siteHref('customize/')}>
            Component presets <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
