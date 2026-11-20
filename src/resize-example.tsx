import { h } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  Disclosure as __themeOriginal_Disclosure,
  Pane as __themeOriginal_Pane,
  ResizeHandle as __themeOriginal_ResizeHandle,
  SplitLayout as __themeOriginal_SplitLayout,
  NumberStepper as __themeOriginal_NumberStepper,
} from '@revolist/ui/preact';
import { withThemePreview } from './theme-preview';

const Disclosure = withThemePreview(__themeOriginal_Disclosure, 'Disclosure');
const Pane = withThemePreview(__themeOriginal_Pane, 'Pane');
const ResizeHandle = withThemePreview(
  __themeOriginal_ResizeHandle,
  'ResizeHandle',
);
const SplitLayout = withThemePreview(
  __themeOriginal_SplitLayout,
  'SplitLayout',
);
const NumberStepper = withThemePreview(
  __themeOriginal_NumberStepper,
  'NumberStepper',
);

export function ResizeExample({ rtl }: { rtl: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(180);
  const [maximum, setMaximum] = useState(300);
  useLayoutEffect(() => {
    const element = host.current!;
    const measure = () => {
      const limit = Math.max(100, Math.min(300, element.clientWidth - 100));
      setMaximum(limit);
      setWidth((current) => Math.min(current, limit));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);
  return (
    <div
      class="catalog-resize-preview"
      ref={host}
      style={{ '--rv-editor-columns': `${width}px minmax(0, 1fr)` }}
    >
      <SplitLayout>
        <Pane className="catalog-resizable-pane">
          <div
            class="catalog-resize-content"
            role="region"
            aria-label="Resizable panel"
          >
            <strong>Resizable content</strong>
            <p>
              Drag the divider, use the arrow keys, or adjust the width below.
            </p>
            <NumberStepper
              label="Panel width in pixels"
              value={width}
              min={100}
              max={maximum}
              step={10}
              decreaseLabel="Narrow panel"
              increaseLabel="Widen panel"
              onChange={setWidth}
            />
            <output aria-label="Panel width value">{width}px</output>
          </div>
          <ResizeHandle
            label="Panel width"
            value={width}
            min={100}
            max={maximum}
            onChange={setWidth}
            direction={rtl ? 'rtl' : 'ltr'}
          />
        </Pane>
        <Pane>
          <div class="catalog-resize-content">
            <Disclosure summary="Advanced settings">
              <p>Native disclosure content</p>
            </Disclosure>
          </div>
        </Pane>
      </SplitLayout>
    </div>
  );
}
