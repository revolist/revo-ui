import { readFile } from 'node:fs/promises';
import { format } from 'prettier';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [
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
