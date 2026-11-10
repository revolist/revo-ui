import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('./', import.meta.url));
function inventory(config) {
  const report = JSON.parse(
    execFileSync(
      'pnpm',
      [
        '--filter',
        '@revolist/ui',
        'exec',
        'playwright',
        'test',
        '--config',
        config,
        '--list',
        '--reporter=json',
      ],
      { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ),
  );
  assert.deepEqual(report.errors, []);
  function cases(suite) {
    return [
      ...(suite.specs ?? []).map((spec) => ({
        file: spec.file,
        title: spec.title,
      })),
      ...(suite.suites ?? []).flatMap(cases),
    ];
  }
  return report.suites.flatMap(cases);
}

test('ordinary gallery discovery excludes every PDF and exhaustive capture case, preserving manual discovery', () => {
  const regular = inventory('playwright.config.ts');
  const pdf = inventory('playwright.pdf.config.ts');
  const audit = inventory('playwright.audit.config.ts');
  assert(
    regular.length > 100,
    'ordinary behavior coverage must remain substantial',
  );
  assert(regular.some((item) => item.file.endsWith('catalog-scope.spec.ts')));
  assert(
    regular.some((item) => item.file.endsWith('visual-audit.spec.ts')),
    'keep ordinary contrast/layout behavior assertions',
  );
  assert(
    regular.every(
      (item) =>
        !/pdf-(viewer|frameworks)\.spec\.ts|gallery-capture\.spec\.ts/.test(
          item.file,
        ),
    ),
  );
  assert(pdf.length >= 12, 'retain the existing PDF viewer behavior cases');
  assert(pdf.every((item) => item.file.endsWith('pdf-viewer.spec.ts')));
  assert.deepEqual(audit.map((item) => item.title).sort(), [
    'capture every migrated component family across themes and widths',
    'capture open picker and overlay states in both themes',
  ]);
});

test('fixture suites retain dedicated, disjoint browser ownership', () => {
  const regular = inventory('playwright.config.ts');
  const fixtures = [
    [
      'playwright.framework-adapters.config.ts',
      ['framework-adapters.spec.ts', 'pdf-frameworks.spec.ts'],
    ],
    ['playwright.tooltip.config.ts', ['tooltip.spec.ts']],
    ['playwright.cdn.config.ts', ['cdn.spec.ts']],
    ['playwright.fields-styles.config.ts', ['fields-styles.spec.ts']],
  ];
  for (const [config, names] of fixtures) {
    const cases = inventory(config);
    assert(cases.length > 0, `${config} must discover its tests`);
    assert(
      cases.every((item) => names.some((name) => item.file.endsWith(name))),
    );
    assert(
      regular.every((item) => !names.some((name) => item.file.endsWith(name))),
    );
    for (const name of names)
      assert(
        cases.some((item) => item.file.endsWith(name)),
        `${config}: missing ${name}`,
      );
  }
});
