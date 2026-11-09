import { expect, test } from './gallery-test';
test.use({ gallerySections: ['menus-and-toolbars'] });
for (const width of [1280, 390]) {
  test(`shared zoom and pan controls at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/components/menus-and-toolbars/');
    const controls = page.getByRole('group', {
      name: 'Zoom and pan',
      exact: true,
    });
    const zoomIn = controls.getByRole('button', {
      name: 'Zoom in',
      exact: true,
    });
    await zoomIn.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Zoom in');
    await expect(zoomIn).toHaveAttribute('aria-describedby', /rv-tooltip/);
    await zoomIn.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    const result = page.getByLabel('Visible range', { exact: true });
    await expect(result).toHaveText('0–100');
    await expect(
      controls.getByRole('button', { name: 'Zoom out', exact: true }),
    ).toHaveAttribute('aria-disabled', 'true');
    await controls
      .getByRole('button', { name: 'Zoom in', exact: true })
      .click();
    await expect(result).toHaveText('0–50');
    await controls
      .getByRole('button', { name: 'Pan right', exact: true })
      .press('Enter');
    await expect(result).toHaveText('25–75');
    await controls
      .getByRole('button', { name: 'Pan left', exact: true })
      .press('Space');
    await expect(result).toHaveText('0–50');
    await controls
      .getByRole('button', { name: 'Reset viewport', exact: true })
      .click();
    await expect(result).toHaveText('0–100');
    await controls.screenshot({ path: info.outputPath('icon-toolbar.png') });
  });
}
