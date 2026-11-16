import {
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
  existsSync,
  mkdirSync,
} from 'node:fs';
import { basename, dirname, relative, resolve } from 'node:path';
import ts from 'typescript';
import { transformAsync } from '@babel/core-angular';

const modulePath = (from, to) => {
  const path = relative(dirname(from), to).replaceAll('\\', '/');
  return path.startsWith('.') ? path : `./${path}`;
};

/** Style modes share types; runtime modules remain separate to isolate styles. */
export function forwardPublicDeclaration(output, destination, target) {
  const declaration = resolve(output, `${target}.d.ts`);
  if (!existsSync(declaration)) return;
  const file = resolve(destination, `${target}.d.ts`);
  const path = modulePath(file, declaration.replace(/\.d\.ts$/, '.js'));
  const source = ts.createSourceFile(
    declaration,
    readFileSync(declaration, 'utf8'),
    ts.ScriptTarget.Latest,
  );
  const hasDefault = source.statements.some(
    (statement) =>
      (ts.isExportAssignment(statement) && !statement.isExportEquals) ||
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword,
      ) ||
      (ts.isExportDeclaration(statement) &&
        statement.exportClause &&
        ts.isNamedExports(statement.exportClause) &&
        statement.exportClause.elements.some(
          (element) => element.name.text === 'default',
        )),
  );
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(
    file,
    `export * from '${path}';\n${hasDefault ? `export { default } from '${path}';\n` : ''}`,
  );
}

const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = resolve(directory, entry.name);
    return entry.isDirectory() ? files(file) : [file];
  });

/** All generated workers come from the same pinned PDF.js module worker. */
export function sharePdfWorker(output) {
  const all = files(output);
  const workers = all.filter((file) =>
    /\/assets\/pdf\.worker\.[^/]+\.js$/.test(file.replaceAll('\\', '/')),
  );
  if (!workers.length) return;
  const canonical = resolve(output, 'browser/pdf.worker.min.mjs');
  if (!existsSync(canonical))
    throw new Error('The public PDF module worker is missing');
  const names = [...new Set(workers.map((file) => basename(file)))];
  const targets = new Set(workers);
  for (const file of all.filter(
    (file) =>
      /\.[cm]?js$/.test(file) && !targets.has(file) && file !== canonical,
  )) {
    let code = readFileSync(file, 'utf8');
    if (!names.some((name) => code.includes(name))) continue;
    const source = ts.createSourceFile(
      file,
      code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS,
    );
    const edits = [];
    function visit(node) {
      if (
        ts.isStringLiteralLike(node) &&
        targets.has(resolve(dirname(file), node.text))
      ) {
        edits.push({
          start: node.getStart(source),
          end: node.end,
          value: JSON.stringify(modulePath(file, canonical)),
        });
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    for (const edit of edits.sort((a, b) => b.start - a.start))
      code = code.slice(0, edit.start) + edit.value + code.slice(edit.end);
    if (names.some((name) => code.includes(name)))
      throw new Error(`Unresolved generated PDF worker URL: ${file}`);
    writeFileSync(file, code);
  }
  for (const file of workers) rmSync(file);
}

/** Compact ngc output without renaming classes, stripping metadata, or folding code. */
export async function compactAngularRuntime(output) {
  for (const directory of [
    resolve(output, 'angular'),
    resolve(output, 'unstyled/angular'),
  ]) {
    for (const file of files(directory).filter((file) =>
      file.endsWith('.js'),
    )) {
      const result = await transformAsync(readFileSync(file, 'utf8'), {
        filename: file,
        sourceType: 'module',
        babelrc: false,
        configFile: false,
        compact: true,
        minified: false,
        comments: true,
      });
      if (!result?.code)
        throw new Error(`Cannot compact Angular output: ${file}`);
      writeFileSync(file, result.code);
    }
  }
}
