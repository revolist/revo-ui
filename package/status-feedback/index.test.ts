// @vitest-environment node

import { expect, it } from 'vitest';
import { resolve } from 'node:path';
import ts from 'typescript';
import { compileAsync } from 'sass-embedded';

// Allow the TypeScript consumer check to finish on shared CI runners.
it('compiles the status feedback entry with strict side-effect import checks and no SCSS declarations', () => {
  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    jsxImportSource: 'preact',
    skipLibCheck: true,
    noEmit: true,
    noUncheckedSideEffectImports: true,
    types: [],
  };
  // Match Angular's SVG support without Vite's ambient stylesheet modules.
  const assets = resolve(import.meta.dirname, 'consumer-assets.d.ts');
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (fileName, languageVersion, ...rest) =>
    fileName === assets
      ? ts.createSourceFile(
          fileName,
          "declare module '*.svg?raw' { const svg: string; export default svg; }",
          ts.ScriptTarget.ES2022,
        )
      : getSourceFile(fileName, languageVersion, ...rest);
  const program = ts.createProgram(
    [resolve(import.meta.dirname, 'index.ts'), assets],
    options,
    host,
  );
  const errors = ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) =>
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
    );
  expect(errors).toEqual([]);
}, 30_000);

it('includes feedback panel and badge styles in the shared stylesheet', async () => {
  const { css } = await compileAsync(
    resolve(import.meta.dirname, '../styles.scss'),
    {
      logger: { warn() {}, debug() {} },
    },
  );
  expect(css).toContain('.rv-status-feedback {');
  expect(css).toContain('.rv-status-badge {');
});
