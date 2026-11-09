import { h } from 'preact';
import { translateAiText } from './ai/translations';
import { SegmentedSwitch } from './segmented-switch';
import { Button } from './controls';

export interface ViewSwitcherControlsProps {
  translations?: Readonly<Record<string, string | undefined>>;
  value: string;
  /** Most recently selected native control, including while Data Grid is visible. */
  controlView?: string;
  views: readonly { id: string; label: string }[];
  busy?: boolean;
  canGoBack?: boolean;
  onSelect(id: string): void;
  onBack(): void;
  error?: string;
  label?: string;
  backLabel?: string;
  /** False shows only Data Grid and the retained active control. */
  showViews?: boolean;
  dataLabel?: string;
}
/** Presentation only; installed plugins own configuration and navigation. */
export function ViewSwitcherControls({
  translations,
  value,
  controlView,
  views,
  busy,
  canGoBack,
  onSelect,
  onBack,
  error,
  label = 'Report view',
  backLabel = 'Back',
  showViews = true,
  dataLabel = 'Data Grid',
}: ViewSwitcherControlsProps) {
  const t = (message: string) => translateAiText(message, translations);
  const control = views.find(
    (view) =>
      view.id === (controlView ?? (value !== 'grid' ? value : undefined)),
  );
  if (!showViews && !control && !error) return null;
  const choices = showViews
    ? views
    : [{ id: 'grid', label: dataLabel }, ...(control ? [control] : [])];
  return (
    <div class="rv-view-switcher-controls">
      <SegmentedSwitch
        role="radiogroup"
        value={value}
        ariaLabel={t(label)}
        disabled={busy}
        options={choices.map((view) => ({
          value: view.id,
          label: t(view.label),
        }))}
        onChange={onSelect}
      />
      {showViews && (
        <Button
          size="compact"
          variant="ghost"
          disabled={busy || !canGoBack}
          onClick={onBack}
        >
          {t(backLabel)}
        </Button>
      )}
      {error && <span role="alert">{t(error)}</span>}
    </div>
  );
}
