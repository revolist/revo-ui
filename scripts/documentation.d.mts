import type { Plugin } from 'vite';
export const documentation: Record<
  string,
  { label: string; title: string; description: string; source?: string }
>;
export function renderDocumentation(source?: string, base?: string): string;
export function documentationPlugin(): Plugin;
