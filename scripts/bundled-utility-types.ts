import { dirname, relative, resolve } from 'node:path';
import { readdirSync } from 'node:fs';
import ts from 'typescript';
import type { Plugin } from 'vite';

/** Bundle private workspace utility declarations with each consuming product. */
export function createBundledUtilityTypes(
  packageRoot: string,
  output = resolve(packageRoot, 'dist'),
) {
  const owners = ['dates', 'chart-utils'].map((name) => ({
    name: `@revolist/ui-${name}`,
    source: resolve(packageRoot, 'internal', name, 'src'),
    destination: resolve(output, '_shared', `ui-${name}`),
  }));
  const files = (directory: string): string[] =>
    readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? files(resolve(directory, entry.name))
        : /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name)
          ? [resolve(directory, entry.name)]
          : [],
    );
  function rewrite(filePath: string, content: string) {
    return content.replace(
      /(['"])(@revolist\/(?:ui-chart-utils|chart-utils|ui-dates|dates|ui|data-query))(?:\/([^'"]+))?\1/g,
      (_match, quote: string, name: string, subpath?: string) => {
        const owner = owners.find((candidate) => candidate.name === name);
        if (!owner) return _match;
        const target =
          relative(
            dirname(filePath),
            resolve(
              owner.destination,
              subpath ?? (name === '@revolist/ui' ? 'native' : 'index'),
            ),
          ).replaceAll('\\', '/') +
          (name === '@revolist/data-query' ? '.js' : '');
        return `${quote}${target.startsWith('.') ? target : `./${target}`}${quote}`;
      },
    );
  }
  return {
    rewrite,
    plugin: {
      name: 'bundled-utility-declarations',
      configResolved(config) {
        for (const owner of owners) {
          owner.destination = resolve(
            config.root,
            config.build.outDir,
            '_shared',
            owner.name.slice('@revolist/'.length),
          );
        }
      },
      closeBundle() {
        for (const { source, destination } of owners) {
          const program = ts.createProgram(files(source), {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            declaration: true,
            emitDeclarationOnly: true,
            skipLibCheck: true,
            strict: true,
            types: [],
            jsx: ts.JsxEmit.ReactJSX,
            jsxImportSource: 'preact',
            rootDir: source,
            outDir: destination,
          });
          const result = program.emit(undefined, (filePath, content) => {
            // Private packages are bundled, including their transitive declarations.
            // Raw SVGs and Sass never need resolution by a consuming TS application.
            const rewritten = rewrite(filePath, content)
              .replace(/^import ['"][^'"]+\.(?:scss|css)['"];\r?\n?/gm, '')
              .replace(
                /^export \{ default as (\w+) \} from ['"][^'"]+\?raw['"];\r?\n?/gm,
                'export declare const $1: string;\n',
              );
            ts.sys.writeFile(filePath, rewritten);
          });
          const errors = [
            ...ts.getPreEmitDiagnostics(program),
            ...result.diagnostics,
          ].filter((d) => d.category === ts.DiagnosticCategory.Error);
          if (errors.length)
            throw new Error(
              ts.formatDiagnosticsWithColorAndContext(errors, {
                getCanonicalFileName: (f) => f,
                getCurrentDirectory: () => packageRoot,
                getNewLine: () => '\n',
              }),
            );
        }
      },
    } satisfies Plugin,
  };
}
