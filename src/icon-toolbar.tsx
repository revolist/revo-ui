import { h } from 'preact';
import { useState } from 'preact/hooks';
import { IconToolbar, ICON_TOOLBAR_ICONS } from '@revolist/ui/icon-toolbar';
import { Example } from './catalog';

export function IconToolbarExample() {
  const [window, setWindow] = useState({ start: 0, span: 100 });
  return (
    <Example title="Zoom and pan controls">
      <IconToolbar label="Zoom and pan" actions={[
        { id: 'zoom-in', label: 'Zoom in', icon: ICON_TOOLBAR_ICONS.plus, disabled: window.span <= 10 },
        { id: 'zoom-out', label: 'Zoom out', icon: ICON_TOOLBAR_ICONS.minus, disabled: window.span >= 100 },
        { id: 'pan-left', label: 'Pan left', icon: ICON_TOOLBAR_ICONS.arrowLeft, disabled: window.start <= 0 },
        { id: 'pan-right', label: 'Pan right', icon: ICON_TOOLBAR_ICONS.arrowRight, disabled: window.start + window.span >= 100 },
        { id: 'reset', label: 'Reset viewport', icon: ICON_TOOLBAR_ICONS.reset },
      ]} onAction={action => setWindow(current => {
        if (action === 'reset') return { start: 0, span: 100 };
        const span = action === 'zoom-in' ? Math.max(10, current.span / 2)
          : action === 'zoom-out' ? Math.min(100, current.span * 2) : current.span;
        const start = action === 'pan-left' ? current.start - span / 2
          : action === 'pan-right' ? current.start + span / 2 : current.start;
        return { start: Math.max(0, Math.min(100 - span, start)), span };
      })} />
      <output aria-label="Visible range" aria-live="polite">{window.start}–{window.start + window.span}</output>
    </Example>
  );
}
