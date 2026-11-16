import { expect, test, type Locator } from '@playwright/test';

async function expectAnchored(trigger: Locator, popup: Locator, gap = 4) {
  await expect(popup).toBeVisible();
  await expect
    .poll(async () => {
      const anchor = (await trigger.boundingBox())!;
      const menu = (await popup.boundingBox())!;
      return Math.min(
        Math.abs(menu.y - anchor.y - anchor.height - gap),
        Math.abs(anchor.y - menu.y - menu.height - gap),
      );
    })
    .toBeLessThanOrEqual(2);
}

test('remote lookup follows visual viewport pan, keyboard resize and page scroll', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/components/multi-selects-autocomplete/');
  const example = page.locator('#example-remote-lookup-field');
  await example
    .getByRole('button', { name: 'Select linked record', exact: true })
    .click();
  const trigger = example.getByRole('combobox', {
    name: 'Linked records',
    exact: true,
  });
  await trigger.evaluate((element) => {
    window.scrollBy(0, element.getBoundingClientRect().top - 200);
  });
  await trigger.click();
  const popup = page.locator('.revo-dropdown-menu');
  await expectAnchored(trigger, popup);
  // Mobile keyboards can pan the visual viewport without a layout scroll.
  await example.evaluate((element) => {
    element.style.transform = 'translateY(60px)';
    window.visualViewport!.dispatchEvent(new Event('scroll'));
  });
  await expectAnchored(trigger, popup);
  await page.evaluate(() => window.scrollBy(0, 40));
  await expectAnchored(trigger, popup);
  await page.evaluate(() => {
    const viewport = window.visualViewport!;
    Object.defineProperties(viewport, {
      offsetTop: { configurable: true, value: 40 },
      height: { configurable: true, value: 350 },
    });
    viewport.dispatchEvent(new Event('resize'));
  });
  await expectAnchored(trigger, popup);
  await expect
    .poll(async () => {
      const box = (await popup.boundingBox())!;
      return box.y + box.height;
    })
    .toBeLessThanOrEqual(385);
  await page
    .getByRole('textbox', { name: 'Search options', exact: true })
    .fill('des');
  await page.getByRole('option', { name: 'Design', exact: true }).click();
  await expect(example.locator('output')).toHaveText('"design"');
});
