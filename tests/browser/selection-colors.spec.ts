import { chooseOption } from './choose-option';
import { test, expect } from './gallery-test';

for (const theme of ['light', 'dark']) {
  test(`selected surfaces match the calendar in ${theme}`, async ({
    page,
  }, info) => {
    await page.goto('/#components');
    await chooseOption(
      page.getByRole('button', { name: 'Theme', exact: true }),
      theme === 'light' ? 'Light' : 'Dark',
    );
    await page
      .getByRole('switch', { name: 'Animations', exact: true })
      .uncheck();
    const calendar = page.locator('.catalog-example').filter({
      has: page.getByRole('heading', { name: 'Calendar', exact: true }),
    });
    await calendar.getByRole('button', { name: /^Choose month:/ }).click();
    const month = calendar.locator('.revo-calendar__month.active');
    await expect(month).toBeVisible();
    const background = await month.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    );
    const toggle = page.getByRole('button', { name: 'Toggle', exact: true });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveCSS('background-color', background);
    await expect(toggle).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    const accentText = await month.evaluate(
      (node) => getComputedStyle(node).color,
    );
    await expect(toggle).toHaveCSS('color', accentText);
    await expect(toggle).toHaveCSS('font-weight', '500');
    for (const button of await page
      .locator('.rv-format-segmented__button--selected')
      .all()) {
      await expect(button).toHaveCSS('color', accentText);
      await expect(button).toHaveCSS('box-shadow', 'none');
      await expect(button).toHaveCSS('border-top-width', '0px');
    }
    const tabs = page.locator('#tabs-and-lists .rv-segmented-switch-item.on');
    const tabBackground = await tabs.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    );
    await expect(tabs).toHaveCSS('font-weight', '500');
    await expect(tabs).toHaveCSS('color', accentText);
    await expect(tabs).toHaveCSS('height', '31px');
    await expect(tabs).toHaveCSS('border-top-width', '1px');
    await expect(tabs).not.toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    const tabGroup = page.locator('#tabs-and-lists .rv-segmented-switch');
    await expect(tabGroup).toHaveCSS('height', '37px');
    await expect(tabGroup).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    const groupBackground = await tabGroup.evaluate(
      (node) => getComputedStyle(node).backgroundColor,
    );
    const cardBackground = await tabGroup.evaluate(
      (node) =>
        getComputedStyle(node.closest('.catalog-example')!).backgroundColor,
    );
    expect(groupBackground).not.toBe(cardBackground);
    for (const tab of await tabGroup
      .locator('.rv-segmented-switch-item:not(.on)')
      .all()) {
      await expect(tab).toHaveCSS('font-weight', '400');
    }
    for (const tab of await tabGroup
      .locator('.rv-segmented-switch-item:not(.on):not(:disabled)')
      .all()) {
      await expect(tab).toHaveCSS(
        'color',
        theme === 'light' ? 'rgb(23, 23, 23)' : 'rgb(245, 245, 245)',
      );
      await tab.hover();
      await expect(tab).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      await expect(tab).not.toHaveCSS('background-color', groupBackground);
    }
    for (const label of await page
      .locator('.rv-option-button[aria-pressed="true"] > strong')
      .all()) {
      await expect(label).toHaveCSS('font-weight', '500');
      await expect(label).toHaveCSS('color', accentText);
    }
    for (const selector of [
      '.rv-editor-list__item--selected',
      '.rv-choice-chip[aria-pressed="true"]:not([data-color="true"])',
      '.rv-format-segmented__button--selected',
      '.rv-resource-picker__option[data-selected="true"]',
      '.rv-toolbar--surface > .rv-btn-icon[aria-pressed="true"]',
    ]) {
      const items = page.locator(selector);
      expect(await items.count(), selector).toBeGreaterThan(0);
      for (const item of await items.all())
        await expect(item).toHaveCSS('background-color', background);
    }
    for (const item of await page
      .locator(
        '.rv-choice-chip[aria-pressed="true"], .rv-choice-chip[data-selected="true"], .rv-option-button[aria-pressed="true"]',
      )
      .all()) {
      await expect(item).toHaveCSS('border-top-color', 'rgba(0, 0, 0, 0)');
    }
    const budget = page.getByRole('slider', { name: 'Budget', exact: true });
    const budgetField = budget.locator('xpath=ancestor::label');
    const budgetFill = await budget.evaluate(
      (node) => getComputedStyle(node).backgroundImage,
    );
    expect(budgetFill).toContain('rgb(229, 57, 53)');
    const bubble = budgetField.locator('.rv-slider-field__thumb-value');
    const expectedBubble = await budgetField.evaluate((node) => {
      const probe = document.createElement('span');
      probe.style.background =
        'color-mix(in srgb, var(--range-color) 65%, black)';
      node.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(bubble).toHaveCSS('background-color', expectedBubble);
    await expect(bubble).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page
      .getByRole('combobox', { name: 'Searchable view', exact: true })
      .click();
    await expect(page.locator('.revo-dropdown-menu .selected')).toHaveCSS(
      'background-color',
      background,
    );
    await expect(page.locator('.revo-dropdown-menu .selected')).toHaveCSS(
      'color',
      theme === 'light' ? 'rgb(23, 23, 23)' : 'rgb(245, 245, 245)',
    );
    await page.keyboard.press('Escape');
    const resource = page
      .locator('.rv-resource-picker__option[data-selected="true"]')
      .first();
    await expect(resource).toHaveCSS(
      'color',
      theme === 'light' ? 'rgb(23, 23, 23)' : 'rgb(245, 245, 245)',
    );
    const panelBackground = await page
      .locator('.rv-configurator-field-row')
      .first()
      .evaluate((node) => getComputedStyle(node).backgroundColor);
    const unselectedResource = page
      .locator('.rv-resource-picker__option[data-selected="false"]')
      .first();
    await unselectedResource.hover();
    await expect(unselectedResource).toHaveCSS(
      'background-color',
      panelBackground,
    );
    await resource.hover();
    await expect(resource).toHaveCSS('background-color', background);
    const tags = page.locator('.selected-tag');
    expect(await tags.count()).toBeGreaterThan(0);
    for (const tag of await tags.all())
      await expect(tag).toHaveCSS(
        'background-color',
        theme === 'light' ? 'rgb(238, 238, 238)' : 'rgb(43, 43, 43)',
      );
    await page
      .locator('#tabs-and-lists')
      .screenshot({ path: info.outputPath(`selection-${theme}.png`) });
    // A shared token override must also reach components that used local mixes.
    await page
      .locator('.catalog')
      .evaluate((node) =>
        (node as HTMLElement).style.setProperty(
          '--rv-ui-selected-bg',
          'rgb(10, 20, 30)',
        ),
      );
    await expect(month).toHaveCSS('background-color', 'rgb(10, 20, 30)');
    await expect(
      page.locator('.rv-editor-list__item--selected').first(),
    ).toHaveCSS('background-color', 'rgb(10, 20, 30)');
    await expect(tabs).toHaveCSS('background-color', tabBackground);
  });
}
