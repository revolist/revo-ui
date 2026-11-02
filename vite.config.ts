import { readFile } from 'node:fs/promises';
import { format } from 'prettier';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { componentApi, apiModule } from './scripts/component-api.mjs';
export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [
    {
      name: 'gallery-component-api',
      resolveId(id) {
        if (id === 'virtual:component-api') return '\0virtual:component-api';
      },
      load(id) {
        if (id !== '\0virtual:component-api') return;
        const library = resolve(import.meta.dirname, '../..');
        return apiModule(componentApi(library, import.meta.dirname, file => this.addWatchFile(file)));
      },
    },
    {
      name: 'gallery-formatted-source',
      enforce: 'pre',
      async load(id) {
        if (!id.includes('/revo-ui/src/') || !id.endsWith('.tsx?raw'))
          return;
        const source = await readFile(id.slice(0, -4), 'utf8');
        return `export default ${JSON.stringify(await format(source, { parser: 'typescript', singleQuote: true, printWidth: 80 }))}`;
      },
    },
    preact(),
  ],
  build: { outDir: 'dist' },
});
