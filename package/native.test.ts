// @vitest-environment node
import { expect, it } from 'vitest';
import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import * as native from './native';

it('imports native UI without a browser or a rendering runtime', () => {
  expect(typeof globalThis.document).toBe('undefined');
  expect(native.DialogController).toBeTypeOf('function');
  expect(native.createAvatarElement).toBeTypeOf('function');
});

it('bundles the native entry without grid, product, or Preact imports', async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [
      {
        name: 'native-dependency-boundary',
        resolveId(source) {
          if (
            /^(?:preact|@revolist\/(?:revogrid|revogrid-pro|charts|pivot|gantt|kanban|scheduler))(?:\/|$)/.test(
              source,
            )
          )
            throw new Error(`Native UI imported ${source}`);
        },
      },
    ],
    build: {
      write: false,
      lib: {
        entry: fileURLToPath(new URL('./native.ts', import.meta.url)),
        formats: ['es'],
      },
      minify: false,
    },
  });
  const outputs = Array.isArray(result) ? result : [result];
  const code = outputs
    .flatMap((output) =>
      'output' in output
        ? output.output
            .filter((chunk) => chunk.type === 'chunk')
            .map((chunk) => chunk.code)
        : [],
    )
    .join('\n');
  expect(code).toContain('DialogController');
  expect(code).not.toMatch(/from ["'](?:preact|@revolist\/)/);
});
