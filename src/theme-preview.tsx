import { createContext, h, type ComponentType } from 'preact';
import { forwardRef } from 'preact/compat';
import { uiComponents } from '@revolist/ui/framework';
import { useContext, useLayoutEffect } from 'preact/hooks';
import type { ThemePreview } from './theme-editor';
import { presetProps } from '@revolist/ui/presets';

export const ThemePreviewContext = createContext<
  | {
      preview?: ThemePreview;
      report: (change: number) => void;
    }
  | undefined
>(undefined);

/** Gallery-only adapter for previewing a preset inside composed examples. */
export function withThemePreview<C extends ComponentType<any>>(
  component: C,
  name: string,
): C {
  const wrapped = forwardRef<any, any>((props, ref) => {
    const context = useContext(ThemePreviewContext);
    const requested = context?.preview?.component;
    const registry = uiComponents as Record<string, unknown>;
    const selected =
      !!requested &&
      (requested === name ||
        (registry[requested] !== undefined &&
          registry[requested] === registry[name]) ||
        (requested === 'AiPromptInput' && name === 'AiChatComposer'));
    const report = context?.report;
    useLayoutEffect(() => {
      if (!selected || !report) return;
      report(1);
      return () => report(-1);
    }, [selected, report]);
    return h(component, {
      ...(selected ? presetProps(context?.preview?.preset) : {}),
      ...props,
      ...(selected ? { preset: context?.preview?.preset } : {}),
      ref,
    });
  });
  return wrapped as unknown as C;
}
