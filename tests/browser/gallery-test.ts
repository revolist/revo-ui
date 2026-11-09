import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const componentSections = (
  JSON.parse(
    readFileSync(
      new URL('../../src/pages.json', import.meta.url),
      'utf8',
    ),
  ) as {
    components: Array<{ title: string }>;
  }
).components.map(({ title }) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
);

type GalleryOptions = {
  gallerySections: string[];
  galleryPdf: boolean;
};

export const test = base.extend<GalleryOptions>({
  gallerySections: [[], { option: true }],
  galleryPdf: [false, { option: true }],
  page: async ({ page, baseURL, gallerySections, galleryPdf }, use) => {
    // Set scope before application code mounts; hiding sections afterwards still
    // starts their components, effects and PDF workers on every page load.
    await page.addInitScript(
      ({ origin, sections, allSections, pdf }) => {
        const url = new URL(location.href);
        if (
          url.origin !== origin ||
          url.pathname !== '/' ||
          url.searchParams.get('page') === 'colors'
        )
          return;
        const specimenView = sections.length > 0 || url.hash === '#components';
        if (!url.searchParams.has('section')) {
          // Legacy all-component tests exercise specimens, while an ordinary
          // /components/ visit retains the production component directory.
          const mountedSections = sections.length
            ? sections
            : url.hash === '#components'
              ? allSections
              : [];
          for (const section of mountedSections)
            url.searchParams.append('section', section);
          if (sections.length && !url.hash) url.hash = '#components';
        }
        if (
          !pdf &&
          specimenView &&
          !url.searchParams.getAll('exclude').includes('pdf-viewer')
        )
          url.searchParams.append('exclude', 'pdf-viewer');
        history.replaceState(history.state, '', url);
      },
      {
        origin: new URL(baseURL!).origin,
        sections: gallerySections,
        allSections: componentSections,
        pdf: galleryPdf,
      },
    );
    await use(page);
  },
});

export { expect };
export type { Locator, Page } from '@playwright/test';
