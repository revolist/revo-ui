import { realpathSync } from 'node:fs';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'node:path';
export default defineConfig({
  plugins: [svelte()],
  root: resolve(
    import.meta.dirname,
    'tests/browser/fixtures/framework-adapters',
  ),
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  server: {
    host: '127.0.0.1',
    port: 4183,
    strictPort: true,
    fs: {
      allow: [
        import.meta.dirname,
        realpathSync(resolve(import.meta.dirname, 'node_modules/pdfjs-dist')),
        realpathSync(
          resolve(
            import.meta.dirname,
            'node_modules/@fortawesome/fontawesome-free',
          ),
        ),
      ],
    },
  },
  oxc: {
    decorator: { legacy: true },
    jsx: { runtime: 'automatic', importSource: 'preact' },
  },
});
