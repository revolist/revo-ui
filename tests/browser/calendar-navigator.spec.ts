import { expect, test } from '@playwright/test';
import { compile } from 'sass';

test('calendar navigation keeps outer corners in both writing directions', async ({
  page,
}) => {
  const css = compile('package/calendar/_calendar.scss').css;
  await page.setContent(
    `<style>${css}</style><div class="rv-calendar-navigator"><button>Previous</button><button>Today</button><button>Next</button><div class="rv-date-picker"><button class="rv-calendar-navigator__trigger">Calendar</button></div></div>`,
  );
  const navigator = page.locator('.rv-calendar-navigator');
  const first = navigator.locator('button').first();
  const last = navigator.locator('.rv-calendar-navigator__trigger');
  await expect(first).toHaveCSS('border-top-left-radius', '8px');
  await expect(last).toHaveCSS('border-top-right-radius', '8px');
  await navigator.evaluate((element) => element.setAttribute('dir', 'rtl'));
  await expect(first).toHaveCSS('border-top-right-radius', '8px');
  await expect(last).toHaveCSS('border-top-left-radius', '8px');
});
