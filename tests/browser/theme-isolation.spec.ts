import { expect, test } from '@playwright/test';
import { compile } from 'sass-embedded';
import { resolve } from 'node:path';

const css = compile(resolve(process.cwd(), 'package/styles.scss')).css;

test('theme tokens do not change the host page color scheme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setContent(`
    <div id="outside" style="overflow:auto; width:50px; height:50px"><div style="height:200px"></div></div>
    <div id="light" data-theme="light"><input class="rv-control"></div>
    <div id="dark" data-theme="dark"><input class="rv-control"></div>
  `);
  await page.addStyleTag({ content: css });
  const root = page.locator('html');
  const outside = page.locator('#outside');
  await expect(root).toHaveCSS('color-scheme', 'normal');
  await expect(outside).toHaveCSS('color-scheme', 'normal');
  await expect(page.locator('#light')).toHaveCSS('color-scheme', 'normal');
  await expect(page.locator('#dark')).toHaveCSS('color-scheme', 'normal');
  await expect(page.locator('#light input')).toHaveCSS('color-scheme', 'light');
  await expect(page.locator('#dark input')).toHaveCSS('color-scheme', 'dark');
  await root.evaluate(el => el.classList.add('dark'));
  await expect(root).toHaveCSS('color-scheme', 'normal');
  await expect(outside).toHaveCSS('color-scheme', 'normal');
  await expect(root).toHaveCSS('--rv-ui-color-scheme', 'dark');
  await root.evaluate(el => { el.classList.remove('dark'); el.setAttribute('data-theme', 'light'); el.style.colorScheme = 'light'; });
  await expect(root).toHaveCSS('color-scheme', 'light');
  await expect(outside).toHaveCSS('color-scheme', 'light');
  await expect(root).toHaveCSS('--rv-ui-color-scheme', 'light');
});
