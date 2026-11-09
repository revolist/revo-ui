import { defineConfig } from 'vite';
import dts from 'unplugin-dts/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createBundledUtilityTypes } from './scripts/bundled-utility-types.ts';

const root = import.meta.dirname;
const manifest = JSON.parse(
  readFileSync(resolve(root, 'package.json'), 'utf8'),
);
const entries = Object.fromEntries(
  Object.values<string>(manifest.exports)
    .filter(
      (source) =>
        /\.tsx?$/.test(source) &&
        !/(?:angular-control|angular)\.ts$/.test(source),
    )
    .map((source) => [
      source.replace(/^\.\/src\//, '').replace(/\.tsx?$/, ''),
      resolve(root, source),
    ]),
);
const utilities = createBundledUtilityTypes(root);

export default defineConfig({
  root,
  // Shared UI never injects a product watermark, including during trial builds.
  plugins: [
    svelte(),
    utilities.plugin,
    dts({
      tsconfigPath: resolve(root, 'tsconfig.json'),
      entryRoot: resolve(root, 'src'),
      include: ['src'],
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
      beforeWriteFile: (filePath, content) => ({
        filePath,
        content: utilities.rewrite(filePath, content),
      }),
    }),
  ],
  oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  build: {
    outDir: 'dist',
    lib: { entry: entries, formats: ['es'] },
    rolldownOptions: {
      external: [
        /^(?:pdfjs-dist|react|react-dom|svelte|vue|@angular\/core)(?:\/|$)/,
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name]-[hash].js',
      },
    },
  },
});
