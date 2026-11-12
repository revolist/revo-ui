import { documentationPlugin } from './scripts/documentation.mjs';
import dts from 'unplugin-dts/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { createBundledUtilityTypes } from './scripts/bundled-utility-types.ts';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { format } from 'prettier';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { componentApi, apiModule } from './scripts/component-api.mjs';
export default defineConfig(({ mode }) => {
  if (mode === 'browser') {
    return {
      root: import.meta.dirname,
      oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
      build: {
        outDir: 'dist/browser',
        target: 'esnext',
        lib: {
          entry: resolve(import.meta.dirname, 'package/browser.ts'),
          name: 'RevoUI',
          formats: ['es', 'iife'],
          fileName: (format) =>
            format === 'es' ? 'revo-ui.js' : 'revo-ui.global.js',
          cssFileName: 'pdf-viewer',
        },
        rolldownOptions: { output: { inlineDynamicImports: true } },
      },
    };
  }
  if (mode === 'library' || mode === 'library-unstyled') {
    const root = import.meta.dirname;
    const manifest = JSON.parse(
      readFileSync(resolve(root, 'package.json'), 'utf8'),
    );
    const entries = Object.fromEntries(
      Object.values<string>(manifest.exports)
        .filter(
          (source) =>
            source.startsWith('./package/') &&
            /\.tsx?$/.test(source) &&
            !/(?:angular-control|angular)\.ts$/.test(source),
        )
        .map((source) => [
          source.replace(/^\.\/package\//, '').replace(/\.tsx?$/, ''),
          resolve(root, source),
        ]),
    );
    entries['core/component-styles'] = resolve(
      root,
      'package/core/component-styles.ts',
    );
    entries['component-style-families'] = resolve(
      root,
      'package/component-style-families.ts',
    );
    const utilities = createBundledUtilityTypes(root);

    return {
      root,
      // Shared UI never injects a product watermark, including during trial builds.
      plugins: [
        {
          name: 'extracted-css-entries',
          load(id) {
            if (
              mode === 'library-unstyled' &&
              id === resolve(root, 'package/core/tooltip-surface.ts')
            )
              return readFileSync(id, 'utf8').replace(
                /export const TOOLTIP_STYLES = `[\s\S]*?`;/,
                'export const TOOLTIP_STYLES = "";',
              );
            if (
              mode === 'library-unstyled' &&
              id === resolve(root, 'package/core/component-styles.ts')
            )
              return readFileSync(id, 'utf8').replace(
                'const automaticStyles = true;',
                'const automaticStyles = false;',
              );
            if (
              mode === 'library-unstyled' &&
              id === resolve(root, 'package/component-style-families.ts')
            ) {
              const source = readFileSync(id, 'utf8');
              return [...source.matchAll(/export const (\w+)Styles/g)]
                .map((match) => `export const ${match[1]}Styles = [];`)
                .join('\n');
            }
          },
        },
        svelte(),
        utilities.plugin,
        dts({
          tsconfigPath: resolve(root, 'tsconfig.json'),
          entryRoot: resolve(root, 'package'),
          include: ['package'],
          exclude: ['**/*.test.ts', '**/*.test.tsx'],
          beforeWriteFile: (filePath, content) => ({
            filePath,
            content: utilities.rewrite(filePath, content),
          }),
        }),
      ],
      oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
      build: {
        outDir: mode === 'library-unstyled' ? 'dist/unstyled' : 'dist',
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
    };
  }
  return {
    root: resolve(import.meta.dirname),
    define: {
      __UI_VERSION__: JSON.stringify(
        JSON.parse(
          readFileSync(resolve(import.meta.dirname, './package.json'), 'utf8'),
        ).version,
      ),
    },
    plugins: [
      documentationPlugin(),
      {
        name: 'gallery-component-api',
        resolveId(id) {
          if (id === 'virtual:component-api') return '\0virtual:component-api';
        },
        load(id) {
          if (id !== '\0virtual:component-api') return;
          const library = resolve(import.meta.dirname);
          return apiModule(
            componentApi(library, import.meta.dirname, (file) =>
              this.addWatchFile(file),
            ),
          );
        },
      },
      {
        name: 'gallery-formatted-source',
        enforce: 'pre',
        async load(id) {
          if (
            !id.startsWith(resolve(import.meta.dirname, 'src') + '/') ||
            !id.endsWith('.tsx?raw')
          )
            return;
          const source = await readFile(id.slice(0, -4), 'utf8');
          return `export default ${JSON.stringify(await format(source, { parser: 'typescript', singleQuote: true, printWidth: 80 }))}`;
        },
      },
      preact(),
    ],
    build: { outDir: 'dist-gallery' },
  };
});
