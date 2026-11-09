import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { searchForWorkspaceRoot } from 'vite';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  server: { fs: { allow: [searchForWorkspaceRoot(import.meta.dirname), realpathSync(resolve(import.meta.dirname, 'node_modules/@fortawesome/fontawesome-free'))] } },
  oxc: { decorator: { legacy: true } },
  plugins: [preact({ reactAliasesEnabled: false })],
  test: { name: '@revolist/ui', ...(process.env.CI ? { maxWorkers: process.env.REVOGRID_UNIT_TEST_WORKERS === '2' ? 2 : 1 } : {}), include: ['src/**/*.test.{ts,tsx}'], environment: 'happy-dom', css: true },
});
