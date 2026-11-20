import type { Snippet } from 'svelte';
import type { VNode } from 'preact';
import { componentRenderSlots } from './component-metadata';
import { withFrameworkContent } from './framework-mount';

/** Content props shared with the React adapter; scalars remain ordinary props. */
export const svelteContentProps = [
  'children',
  'footer',
  'label',
  'description',
  'icon',
  'summary',
  'start',
  'end',
  'empty',
  'highlight',
  'actions',
  'heading',
  'placeholder',
  'indicator',
  'avatar',
  'timestamp',
  'header',
  'details',
  'formatted',
  'hint',
  'iconContent',
  'content',
  'loadingContent',
  'errorContent',
  'caption',
  'count',
  'detail',
  'leading',
  'trailing',
  'shortcut',
  'info',
] as const;
export type SvelteContentKey = (typeof svelteContentProps)[number];
type Content = Snippet<[any]>;

/** Svelte owns snippets; Preact receives only the shared content target VNode. */
export function withSvelteContent(
  name: string,
  props: Record<string, unknown>,
  slots: Record<string, Content>,
  content: (snippet: Content, scope?: Record<string, unknown>) => VNode,
): Record<string, unknown> {
  const result = { ...props };
  const mappings = componentRenderSlots(name);
  const mappedProps = new Set(Object.values(mappings).map((slot) => slot.prop));
  const contents = { ...slots };
  for (const key of svelteContentProps) {
    if (typeof result[key] === 'function') {
      result[key] = content(result[key] as Content);
    }
  }
  for (const [alias, mapping] of Object.entries(mappings)) {
    const snippet = result[mapping.prop];
    if (typeof snippet === 'function' && !contents[alias]) {
      contents[alias] = snippet as Content;
    }
  }
  for (const [key, value] of Object.entries(result)) {
    if (
      /^render[A-Z]/.test(key) &&
      !mappedProps.has(key) &&
      typeof value === 'function'
    ) {
      result[key] = (...args: unknown[]) => content(value as Content, { args });
    }
  }
  return withFrameworkContent(name, result, contents, content);
}
