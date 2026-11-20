import { expect, test } from '@playwright/test';
import documentation from '../../src/documentation.json' with { type: 'json' };

test('SSR and bundle guides have sidebar pages, rendered Markdown and working local anchors', async ({
  page,
}) => {
  await page.goto('/frameworks/');
  const navigation = page.getByRole('navigation', {
    name: 'Documentation navigation',
  });
  await navigation.getByRole('link', { name: 'SSR', exact: true }).click();
  await expect(page).toHaveURL(/\/frameworks\/ssr\/$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Server rendering and hydration',
    }),
  ).toBeVisible();
  await expect(
    navigation.getByRole('link', { name: 'SSR', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('article pre code').first()).toContainText(
    'import',
  );
  await expect(page.locator('article table').first()).toBeVisible();
  await expect(page).toHaveTitle(`${documentation.ssr.seoTitle} · Revo UI`);
  await page.screenshot({ path: test.info().outputPath('ssr-desktop.png') });
  await page.getByRole('link', { name: 'style families', exact: true }).click();
  await expect(page).toHaveURL(
    /\/frameworks\/bundle-size\/#stylesheet-families$/,
  );
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Stylesheet families',
      exact: true,
    }),
  ).toBeInViewport();
  await expect(
    navigation.getByRole('link', { name: 'Bundle size', exact: true }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveTitle('Bundle size and selective styles · Revo UI');
});

for (const route of ['ssr', 'bundle-size']) {
  test(`${route} guide keeps tables and code readable on mobile without page overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/frameworks/${route}/`);
    await expect(page.locator('article h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: test.info().outputPath(`${route}-mobile.png`),
    });
    const table = page.locator('.documentation-table').first();
    expect(
      await table.evaluate((node) => node.scrollWidth > node.clientWidth),
    ).toBe(true);
    await table.evaluate((node) => (node.scrollLeft = node.scrollWidth));
    expect(await table.evaluate((node) => node.scrollLeft)).toBeGreaterThan(0);
  });
}

test('Getting started stays focused and CDN content has its own page', async ({
  page,
}) => {
  await page.goto('/frameworks/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Getting started',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Install the package', exact: true }),
  ).toBeVisible();
  for (const name of [
    'SSR and bundle size',
    'Browser ES module import',
    'Build accessible applications',
  ]) {
    await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(
      0,
    );
  }
  await page
    .getByRole('navigation', { name: 'Documentation navigation' })
    .getByRole('link', { name: 'JavaScript / CDN', exact: true })
    .click();
  await expect(page).toHaveURL(/\/frameworks\/javascript-cdn\/$/);
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'JavaScript / CDN',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Browser ES module import',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('article pre').first()).toContainText(
    'browser/revo-ui.js',
  );
  await expect(
    page.getByRole('heading', {
      name: 'Build accessible applications',
      exact: true,
    }),
  ).toHaveCount(0);
});

for (const [hash, target] of [
  ['browser-cdn', 'javascript-cdn'],
  ['server-rendering', 'ssr'],
]) {
  test(`old ${hash} overview links redirect to the dedicated guide`, async ({
    page,
  }) => {
    await page.goto(`/frameworks/#${hash}`);
    await expect(page).toHaveURL(new RegExp(`/frameworks/${target}/$`));
    await expect(page.locator('article h1')).toBeVisible();
  });
}

for (const [route, title] of [
  ['ssr-nextjs', 'Next.js App Router and Revo UI'],
  ['ssr-nuxt', 'Nuxt and Revo UI'],
  ['ssr-sveltekit', 'SvelteKit and Revo UI'],
  ['ssr-astro', 'Astro and Revo UI'],
  ['ssr-angular', 'Angular SSR and Revo UI'],
  ['ssr-react-router', 'React Router and Revo UI'],
  ['ssr-tanstack-start', 'TanStack Start and Revo UI'],
  ['ssr-nestjs', 'NestJS and Revo UI'],
  ['integration-refine', 'Refine and Revo UI'],
  ['integration-lovable', 'Lovable and Revo UI'],
]) {
  test(`${route} starter guide is discoverable and readable`, async ({
    page,
  }) => {
    await page.goto('/frameworks/ssr/');
    await page
      .locator(`article a[href="/frameworks/${route}/"]`)
      .first()
      .click();
    await expect(
      page.getByRole('heading', { level: 1, name: title, exact: true }),
    ).toBeVisible();
    await expect(page).toHaveTitle(
      `${documentation[route as keyof typeof documentation].seoTitle} · Revo UI`,
    );
    await expect(page.locator('article pre code').first()).toBeVisible();
    const source = page
      .locator(
        'article a[href*="github.com/revolist/revo-ui/tree/main/examples/ssr/"]',
      )
      .first();
    await expect(source).toHaveAttribute('href', /examples\/ssr\//);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
  });
}

for (const framework of ['angular', 'svelte']) {
  test(`${framework} guide teaches a selective named component import`, async ({
    page,
  }) => {
    await page.goto(`/frameworks/${framework}/`);
    const example = page.locator('.framework-card pre');
    await expect(example).toContainText(`@revolist/ui/${framework}/svg-button`);
    await expect(example).toContainText('SvgButton');
    await expect(example).not.toContainText('UiComponent');
    await expect(example).not.toContainText('[props]');
  });
}

test('guide search metadata follows navigation without leaking to other pages', async ({
  page,
}) => {
  await page.goto('/frameworks/ssr-nextjs/');
  const schema = page.locator('#documentation-schema');
  await expect(schema).toHaveCount(1);
  await expect(page).toHaveTitle(
    `${documentation['ssr-nextjs'].seoTitle} · Revo UI`,
  );
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb', exact: true }),
  ).toContainText('Next.js SSR');
  const navigation = page.getByRole('navigation', {
    name: 'Documentation navigation',
  });
  await navigation.getByRole('link', { name: 'Svelte', exact: true }).click();
  await expect(page).toHaveTitle(
    'Svelte UI components and integration · Revo UI',
  );
  await expect(schema).toHaveCount(1);
  const article = JSON.parse((await schema.textContent())!)['@graph'].find(
    (item: { '@type': string }) => item['@type'] === 'TechArticle',
  );
  expect(article.headline).toBe('Svelte integration');
  await page
    .getByRole('navigation', { name: 'Svelte related guides' })
    .getByRole('link', { name: 'SvelteKit SSR', exact: true })
    .click();
  await expect(page).toHaveTitle(
    `${documentation['ssr-sveltekit'].seoTitle} · Revo UI`,
  );
  await expect
    .poll(async () => {
      const data = JSON.parse((await schema.textContent())!);
      return data['@graph'].find(
        (item: { '@type': string }) => item['@type'] === 'TechArticle',
      ).headline;
    })
    .toBe('SvelteKit and Revo UI');
  await page
    .getByRole('navigation', { name: 'Library pages' })
    .getByRole('link', { name: 'Overview', exact: true })
    .click();
  await expect(schema).toHaveCount(0);
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb', exact: true }),
  ).toHaveCount(0);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    'content',
    'website',
  );
  await page
    .getByRole('navigation', { name: 'Library pages' })
    .getByRole('link', { name: 'Docs', exact: true })
    .click();
  await expect(page).toHaveTitle('Getting started · Revo UI');
  await expect(schema).toHaveCount(0);
});

test('guide content and related SSR links work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const response = await page.goto(`${baseURL}/frameworks/react/`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'React integration',
    );
    await expect(page.locator('article pre').first()).toContainText(
      '@revolist/ui/react',
    );
    const related = page.getByRole('navigation', {
      name: 'React related guides',
    });
    await expect(
      related.getByRole('link', { name: 'Styles and bundle size' }),
    ).toHaveAttribute('href', '/frameworks/bundle-size/');
    await related
      .getByRole('link', { name: 'Next.js SSR', exact: true })
      .click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      documentation['ssr-nextjs'].title,
    );
    await expect(page.locator('article pre').first()).toBeVisible();
    await expect(page).toHaveTitle(
      `${documentation['ssr-nextjs'].seoTitle} · Revo UI`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://ui.rv-grid.com/frameworks/ssr-nextjs/',
    );
  } finally {
    await context.close();
  }
});
