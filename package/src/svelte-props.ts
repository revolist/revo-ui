import type { Snippet } from 'svelte';
import type { UiComponentName } from './component-catalog';
export interface SvelteUiProps {
  component: UiComponentName;
  props?: Record<string, any>;
  children?: Snippet<[Record<string, unknown>]>;
  slots?: Record<string, Snippet<[Record<string, unknown>]>>;
  onValueChange?: (value: unknown) => void;
  onUiEvent?: (event: { name: string; args: unknown[] }) => void;
}
