import { createRequire } from 'node:module';
import { expect, test } from '@playwright/test';

const require = createRequire(import.meta.url);
const examples = [
  ['tree', '.rv-tree'],
  ['cascader', '.rv-cascader-panel'],
  ['filter-bar', '.rv-filter-bar'],
  ['command-palette', '.rv-command-palette'],
  ['attachments', '.rv-attachments'],
  ['stepper', '.rv-stepper'],
  ['stepper', '#launch-checklist'],
  ['trace', '.rv-trace'],
  ['activity-timeline', '.rv-activity-timeline'],
] as const;

for (const [name, selector] of examples) {
  for (const theme of ['light', 'dark']) {
    test(`${selector} has no scoped axe violations in ${theme}`, async ({
      page,
    }) => {
      await page.addInitScript(
        (value) => localStorage.setItem('revo-ui-theme', value),
        theme,
      );
      await page.goto(`/components/${name}/`);
      await expect(page.locator('.catalog')).toHaveCSS(
        '--rv-ui-color-scheme',
        theme,
      );
      if (name === 'cascader')
        await page.getByRole('button', { name: /^Location:/ }).click();
      if (name === 'command-palette')
        await page.getByRole('button', { name: 'Open commands' }).click();
      if (name === 'trace') await page.locator('.rv-trace summary').click();
      const component = page.locator(selector).first();
      await expect(component).toBeVisible();
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const violations = await component.evaluate(
        async (element: HTMLElement) => {
          const axe = (window as unknown as { axe: typeof import('axe-core') })
            .axe;
          const results = await axe.run(element, {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
            },
          });
          return results.violations.map(({ id, nodes }) => ({
            id,
            nodes: nodes.map(({ target, failureSummary }) => ({
              target,
              failureSummary,
            })),
          }));
        },
      );
      expect(violations).toEqual([]);
    });
  }
}
