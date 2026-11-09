import { chooseOption } from './choose-option';
import { test, expect } from './gallery-test';

test.use({ gallerySections: ['calendar-and-dates'] });

for (const theme of ['light', 'dark']) {
  test(`blocked range feedback is red and recoverable in ${theme}`, async ({
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
    const card = page.locator('.catalog-example').filter({
      has: page.getByRole('heading', { name: 'Range calendar', exact: true }),
    });
    await card.scrollIntoViewIfNeeded();
    const day = (date: string) =>
      card.locator(
        `button[data-calendar-date="${date}"]:not([aria-hidden="true"])`,
      );
    await day('2026-10-10').click();
    await day('2026-10-11').hover();
    await expect(day('2026-10-11')).toHaveAttribute('aria-invalid', 'true');
    await expect(card.getByRole('status')).toHaveText(
      'This date cannot be selected.',
    );
    const descriptionId = await card.getByRole('status').getAttribute('id');
    await expect(day('2026-10-11')).toHaveAttribute(
      'aria-describedby',
      descriptionId!,
    );
    const colors = await day('2026-10-11').evaluate((node) => {
      const probe = document.createElement('span');
      probe.style.cssText =
        'background:color-mix(in srgb,var(--rv-ui-danger) 12%,var(--rv-ui-surface));color:var(--rv-ui-danger)';
      node.append(probe);
      const result = {
        background: getComputedStyle(probe).backgroundColor,
        color: getComputedStyle(probe).color,
      };
      probe.remove();
      return result;
    });
    await expect(day('2026-10-11')).toHaveCSS(
      'background-color',
      colors.background,
    );
    await expect(day('2026-10-11')).toHaveCSS('color', colors.color);
    await expect(day('2026-10-10')).toHaveCSS('border-start-end-radius', '0px');
    await expect(day('2026-10-11')).toHaveCSS(
      'border-start-start-radius',
      '0px',
    );
    await expect(day('2026-10-10')).toHaveCSS('border-inline-end-width', '0px');
    await expect(day('2026-10-11')).toHaveCSS(
      'border-inline-start-width',
      '0px',
    );
    await day('2026-10-26').hover();
    await expect(day('2026-10-11')).toHaveCSS(
      'background-color',
      colors.background,
    );
    await expect(day('2026-10-24')).toHaveCSS(
      'background-color',
      colors.background,
    );
    await expect(day('2026-10-25')).toHaveCSS(
      'background-color',
      colors.background,
    );
    await expect(day('2026-10-25')).toHaveCSS('opacity', '1');
    await expect(day('2026-10-25')).toHaveCSS(
      'text-decoration-line',
      'line-through',
    );
    for (const date of ['2026-10-11', '2026-10-24']) {
      await expect(day(date)).toHaveCSS('border-radius', '0px');
      await expect(day(date)).toHaveCSS('border-inline-start-width', '0px');
      await expect(day(date)).toHaveCSS('border-inline-end-width', '0px');
      await expect(day(date)).toHaveCSS('box-shadow', 'none');
    }
    await card.screenshot({
      path: info.outputPath(`invalid-band-${theme}.png`),
    });
    await page
      .getByRole('switch', { name: 'Right to left', exact: true })
      .check();
    await day('2026-10-26').hover();
    await expect(day('2026-10-10')).toHaveCSS('border-top-right-radius', '7px');
    await expect(day('2026-10-26')).toHaveCSS('border-top-left-radius', '7px');
    await page
      .getByRole('switch', { name: 'Right to left', exact: true })
      .uncheck();
    await day('2026-10-11').hover();
    await day('2026-10-11').click();
    await expect(day('2026-10-10')).toHaveAttribute('aria-selected', 'true');
    await expect(day('2026-10-11')).not.toHaveAttribute(
      'aria-selected',
      'true',
    );
    await card.screenshot({
      path: info.outputPath(`invalid-range-${theme}.png`),
    });
    await day('2026-10-11').focus();
    await page.keyboard.press('ArrowRight');
    await expect(day('2026-10-12')).toBeFocused();
    await expect(day('2026-10-12')).not.toHaveAttribute('aria-invalid');
    await expect(card.getByRole('status')).toHaveText('');
    await page.keyboard.press('Enter');
    await expect(day('2026-10-12')).toHaveAttribute('aria-selected', 'true');
    await expect(card.locator('.in-invalid-preview')).toHaveCount(0);
  });
}
