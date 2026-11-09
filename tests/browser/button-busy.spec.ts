import { chooseOption } from './choose-option';
import { expect, test } from './gallery-test';

test.use({ gallerySections: ['buttons'] });

for (const theme of ['light', 'dark'])
  for (const width of [1280, 390]) {
    test(`busy buttons block actions and retain their appearance in ${theme} at ${width}px`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/#buttons');
      await chooseOption(
        page.getByRole('button', { name: 'Theme', exact: true }),
        theme === 'light' ? 'Light' : 'Dark',
      );
      const example = page.locator('.catalog-example').filter({
        has: page.getByRole('heading', { name: 'Busy buttons', exact: true }),
      });
      await example.scrollIntoViewIfNeeded();
      const save = example.getByRole('button', {
        name: 'Save changes',
        exact: true,
      });
      const output = page.getByRole('status', {
        name: 'Button action',
        exact: true,
      });
      await expect(example.locator('button[aria-busy="true"]')).toHaveCount(4);
      for (const button of await example
        .locator('button[aria-busy="true"]')
        .all()) {
        await expect(button).toBeDisabled();
        await expect(button).toHaveAttribute('aria-busy', 'true');
        await expect(button).toHaveCSS('opacity', '1');
      }
      const boxes = await example
        .locator('button[aria-busy="true"]')
        .evaluateAll((buttons) =>
          buttons.map((button) => {
            const box = button.getBoundingClientRect();
            return {
              left: box.left,
              right: box.right,
              top: box.top,
              bottom: box.bottom,
            };
          }),
        );
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i],
            b = boxes[j];
          expect(
            Math.max(
              b.left - a.right,
              a.left - b.right,
              b.top - a.bottom,
              a.top - b.bottom,
            ),
          ).toBeGreaterThanOrEqual(11.5);
        }
      const color = await save.evaluate((el) => ({
        bg: getComputedStyle(el).backgroundColor,
        fg: getComputedStyle(el).color,
      }));
      const rect = (await save.boundingBox())!;
      await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await expect(output).toHaveText('No action yet');
      const spinner = save.locator('.rv-button-spinner');
      await expect(spinner).toBeVisible();
      await expect(spinner).not.toHaveCSS('animation-name', 'none');
      const animations = page.getByRole('switch', {
        name: 'Animations',
        exact: true,
      });
      const revealAnimations = async () => {
        const options = page.getByRole('button', {
          name: 'More gallery options',
          exact: true,
        });
        if (await options.isVisible()) {
          await expect(options).toHaveAttribute(
            'aria-expanded',
            /^(true|false)$/,
          );
          if ((await options.getAttribute('aria-expanded')) === 'false') {
            await expect(
              page.locator('.gallery-settings-content'),
            ).toBeHidden();
            await options.click();
            await expect(options).toHaveAttribute('aria-expanded', 'true');
          }
        }
        await expect(animations).toBeVisible();
      };
      await revealAnimations();
      await animations.uncheck();
      await expect(spinner).toHaveCSS('animation-name', 'none');
      await revealAnimations();
      await animations.check();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(spinner).toHaveCSS('animation-name', 'none');
      await expect(spinner).toBeVisible();
      await info.attach(`busy-${theme}.png`, {
        body: await example.screenshot({
          path: info.outputPath('busy-buttons.png'),
        }),
        contentType: 'image/png',
      });
      await example
        .getByRole('button', { name: 'Busy state', exact: true })
        .click();
      await expect(save).toBeEnabled();
      await expect(save).not.toHaveAttribute('aria-busy');
      await expect(save.locator('.rv-button-spinner')).toHaveCount(0);
      await expect(save).toHaveCSS('background-color', color.bg);
      await expect(save).toHaveCSS('color', color.fg);
      await save.focus();
      await page.keyboard.press('Enter');
      await expect(output).toHaveText('Busy action clicked');
    });
  }

test('busy submit buttons block implicit form submission', async ({ page }) => {
  await page.goto('/#components');
  await page.evaluate(async () => {
    // Associate the real busy gallery button with a form to exercise native submission.
    const form = document.createElement('form');
    form.setAttribute('aria-label', 'Busy form');
    const input = document.createElement('input');
    input.setAttribute('aria-label', 'Busy form input');
    const button = document.querySelector<HTMLButtonElement>(
      '.catalog-example .rv-btn-busy',
    )!;
    form.id = 'busy-submit-form';
    button.type = 'submit';
    button.setAttribute('form', form.id);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      form.dataset.submitted = 'true';
    });
    form.append(input);
    document.body.append(form);
  });
  await page.getByRole('textbox', { name: 'Busy form input' }).fill('Draft');
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('form', { name: 'Busy form' }),
  ).not.toHaveAttribute('data-submitted');
});
