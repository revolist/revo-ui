import { createApp, createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, it } from 'vitest';
import { VueBadge } from './vue-badge';

it('renders slots and accessible attributes on the server', async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          VueBadge,
          {
            variant: 'neutral',
            shape: 'rounded',
            'aria-label': 'No demos',
            class: 'counter',
          },
          () => '0',
        ),
    }),
  );
  expect(html).toContain('rv-badge--neutral');
  expect(html).toContain('rv-badge--rounded');
  expect(html).toContain('counter');
  expect(html).toContain('aria-label="No demos"');
  expect(html).toContain('>0</span>');
});

it('updates the selected variant without losing its count', async () => {
  const active = ref(false);
  const app = createApp({
    render: () =>
      h(VueBadge, { variant: active.value ? 'accent' : 'neutral' }, () => '70'),
  });
  const host = document.createElement('div');
  app.mount(host);
  try {
    expect(host.querySelector('.rv-badge--neutral')?.textContent).toBe('70');
    active.value = true;
    await nextTick();
    expect(host.querySelector('.rv-badge--accent')?.textContent).toBe('70');
    expect(host.querySelector('.rv-badge--neutral')).toBeNull();
  } finally {
    app.unmount();
  }
});
