import { expect, test } from '@playwright/test';
import { chooseOption } from './choose-option';

for (const width of [390, 1280]) {
  for (const theme of ['light', 'dark']) {
    test(`homepage star invitation stays optional in ${theme} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'dark' ? 'Dark' : 'Light',
      );
      const invitation = page.locator('.home-star-invitation');
      await expect(invitation).toBeVisible();
      await expect(invitation).toContainText('Revo UI is new here.');
      const link = invitation.getByRole('link', {
        name: 'Star on GitHub',
        exact: true,
      });
      await expect(link).toHaveAttribute(
        'href',
        'https://github.com/revolist/revo-ui',
      );
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(
        await invitation.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      ).toBe(true);
      await page
        .locator('.home-hero')
        .getByRole('link', { name: 'Explore components', exact: true })
        .click();
      await expect(page).toHaveURL(/\/components\/buttons\/$/);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(invitation).toHaveCount(0);
    });
  }
}
