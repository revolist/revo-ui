/** Read-only color audit. Run from any directory; use --json for full consumers. */
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../../../', import.meta.url));
const packages = [
  'ui',
  'pro',
  'pivot',
  'charts',
  'gantt',
  'scheduler',
  'kanban',
  'collaborative-editing',
  'trial-control',
];
const literal = /#[\da-f]{3,8}\b|\brgba?\([^)]*\)|\bhsla?\([^)]*\)/gi;
if (process.argv.includes('--palettes')) {
  const { tsImport } = await import('tsx/esm/api');
  const { builtInColorPalettes } = await tsImport(
    '../src/color-palette/built-in-palettes.ts',
    import.meta.url,
  );
  console.log(
    JSON.stringify(
      builtInColorPalettes.map(({ id, title, usage, colors, consumers }) => ({
        id,
        title,
        usage,
        entries: Object.keys(colors).length,
        consumers,
      })),
      null,
      2,
    ),
  );
  process.exit(0);
}
const rows = [];
// Reviewed exceptions: these colors encode data or need concrete values outside CSS.
const exceptions = [
  [/avatar|collaborative-presence|assignment-display/, 'identity-palette'],
  [
    /cell-visuals|thresholds|progress\/_circular|color-picker.constants|color-editor.constants/,
    'data-or-user-color',
  ],
  [
    /cell-flash|formula|filter\/filter.style|column-add-popup/,
    'categorical-palette',
  ],
  [
    /grid-notes|editor-timeline|column-type-progress|charts\/timeline/,
    'data-or-user-color',
  ],
  [
    /export-|\/reporting\.ts|renderer\/theme\.ts|pivot-chart-theme\.ts/,
    'portable-drawing-fallback',
  ],
  [
    /gantt\/assets\/styles|event-scheduler\/styles|event-scheduler\/core|event-scheduler\/ui|gantt-grid-sync/,
    'domain-palette',
  ],
  [
    /timeline-track|conditional-format|palette|\/colors\.ts|renderer\/constants|renderer\/webgl|charts\/geographic|charts\/organization|charts\/treemap/,
    'data-or-user-color',
  ],
];
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await scan(full);
      continue;
    }
    if (
      !/\.(?:scss|css|ts|tsx)$/.test(entry.name) ||
      /\.(?:test|spec)\./.test(entry.name)
    )
      continue;
    const source = await readFile(full, 'utf8');
    source.split('\n').forEach((line, index) => {
      for (const match of line.matchAll(literal)) {
        let color = match[0].toLowerCase().replace(/\s+/g, ' ');
        if (/^#[\da-f]{3,4}$/.test(color))
          color = '#' + [...color.slice(1)].map((c) => c + c).join('');
        const rgb = color.match(
          /^rgb\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)\s*\)$/,
        );
        if (rgb && rgb.slice(1).every((value) => Number(value) <= 255))
          color =
            '#' +
            rgb
              .slice(1)
              .map((value) => Number(value).toString(16).padStart(2, '0'))
              .join('');
        const file = path.relative(root, full);
        const role = file.endsWith('_palette.scss')
          ? 'palette-owner'
          : (exceptions.find(([pattern]) => pattern.test(file))?.[1] ??
            (/palette|color-picker.constants|syntax|highlight|formatting|gantt-color|event-color/.test(
              file,
            )
              ? 'data-or-user-color'
              : /var\(--rv-ui-/.test(line)
                ? 'semantic-fallback'
                : 'review'));
        rows.push({ file, line: index + 1, color, role });
      }
    });
  }
}
for (const pkg of packages)
  await scan(
    path.join(
      root,
      'packages',
      pkg,
      ['pro', 'collaborative-editing'].includes(pkg) ? 'plugins' : 'src',
    ),
  );
if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 2));
else
  for (const pkg of packages) {
    const hits = rows.filter((row) => row.file.startsWith(`packages/${pkg}/`));
    const groups = Object.fromEntries(
      [...new Set(hits.map((row) => row.role))].map((role) => [
        role,
        hits.filter((row) => row.role === role).length,
      ]),
    );
    console.log(
      JSON.stringify({
        package: pkg,
        files: new Set(hits.map((row) => row.file)).size,
        uniqueColors: new Set(hits.map((row) => row.color)).size,
        occurrences: hits.length,
        groups,
      }),
    );
  }
