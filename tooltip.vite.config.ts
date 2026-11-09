import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
export default defineConfig({
  root: import.meta.dirname,
  plugins: [preact({ reactAliasesEnabled: false })],
  optimizeDeps: { entries: ['tests/browser/fixtures/tooltip/index.html'] },
  server: {
    host: '127.0.0.1',
    port: 5197,
    strictPort: true,
    fs: {
      allow: [
        import.meta.dirname,
        realpathSync(
          resolve(
            import.meta.dirname,
            'node_modules/@fortawesome/fontawesome-free',
          ),
        ),
      ],
    },
  },
});
