import { expect, test } from './gallery-test';

test.use({ gallerySections: ['menus-and-toolbars'] });

test('history buttons keep square controls and compact badges in RTL and LTR', async ({
  page,
}) => {
  await page.goto('/#components');
  const toolbar = page.getByRole('toolbar', {
    name: 'Document actions',
    exact: true,
  });
  for (const rtl of [false, true]) {
    await page
      .getByRole('switch', { name: 'Right to left', exact: true })
      .setChecked(rtl);
    for (const name of ['Undo', 'Redo']) {
      const button = toolbar.getByRole('button', { name: new RegExp(name) });
      const geometry = await button.evaluate((element) => {
        const button = element.getBoundingClientRect();
        const badge = element
          .querySelector('.rv-badge')!
          .getBoundingClientRect();
        return {
          buttonWidth: button.width,
          buttonHeight: button.height,
          badgeWidth: badge.width,
          badgeHeight: badge.height,
        };
      });
      expect(geometry.buttonWidth).toBe(geometry.buttonHeight);
      expect(geometry.badgeHeight).toBe(16);
      expect(geometry.badgeWidth).toBeLessThanOrEqual(24);
    }
  }
});
