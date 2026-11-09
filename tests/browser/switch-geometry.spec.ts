import { expect, test } from './gallery-test';

test.use({ gallerySections: ['selection-controls'] });

for (const compact of [false, true]) {
  test(`switch thumbs stay inside their tracks in both directions and states (compact=${compact})`, async ({
    page,
  }) => {
    await page.goto('/#components');
    await page
      .getByRole('switch', { name: 'Animations', exact: true })
      .uncheck();
    const card = page.locator('.catalog-example').filter({
      has: page.getByRole('heading', { name: 'Switches', exact: true }),
    });
    await card.evaluate((element, compact) => {
      if (compact)
        element
          .querySelectorAll('.rv-switch')
          .forEach((control) => control.classList.add('rv-switch-sm'));
      const label = document.createElement('label');
      label.className = `rv-switch-label${compact ? ' rv-switch-sm' : ''}`;
      label.innerHTML =
        '<input type="checkbox" class="rv-switch-input" aria-label="Legacy switch"><span class="rv-switch-track"><span class="rv-switch-thumb"></span></span>';
      element.append(label);
    }, compact);
    const control = card.getByRole('switch', {
      name: 'Enable notifications',
      exact: true,
    });
    for (const rtl of [false, true]) {
      await page
        .getByRole('switch', { name: 'Right to left', exact: true })
        .setChecked(rtl);
      for (const checked of [false, true]) {
        await control.setChecked(checked);
        await card
          .getByRole('checkbox', { name: 'Legacy switch' })
          .evaluate((element, checked) => {
            (element as HTMLInputElement).checked = checked;
          }, checked);
        for (const track of await card.locator('.rv-switch-track').all()) {
          const geometry = await track.evaluate((element) => {
            const track = element.getBoundingClientRect();
            const thumb = element
              .querySelector('.rv-switch-thumb')!
              .getBoundingClientRect();
            return {
              start: thumb.left - track.left,
              end: track.right - thumb.right,
            };
          });
          expect(geometry.start).toBeGreaterThanOrEqual(0);
          expect(geometry.end).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
}
