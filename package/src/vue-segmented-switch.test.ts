import { createApp, createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it, vi } from 'vitest';
import { VueSegmentedSwitch } from './vue-segmented-switch';

const options = [
  { value: 'trends', label: 'Trends' },
  { value: 'disabled', label: 'Unavailable', disabled: true },
  { value: 'teams', label: 'Team mix' },
];

describe('Vue shared segmented switch', () => {
  it('renders shared markup, selected state and Vue slots on the server', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          VueSegmentedSwitch,
          {
            value: 'trends',
            options,
            role: 'group',
            ariaLabel: 'Perspective',
            onChange: vi.fn(),
          },
          { option: ({ option }: any) => h('strong', option.label) },
        ),
    });
    const host = document.createElement('div');
    host.innerHTML = await renderToString(app);
    expect(
      host.querySelector('.rv-segmented-switch')?.getAttribute('aria-label'),
    ).toBe('Perspective');
    expect(host.querySelectorAll('.rv-segmented-switch-item')).toHaveLength(3);
    expect(host.querySelector('button')?.getAttribute('aria-pressed')).toBe(
      'true',
    );
    expect(host.querySelector('strong')?.textContent).toBe('Trends');
    expect(host.querySelectorAll('button')[1].disabled).toBe(true);
  });

  it('uses shared click and keyboard selection, skipping disabled options', async () => {
    const value = ref('trends');
    const change = vi.fn((next: string | number) => {
      value.value = String(next);
    });
    const app = createApp({
      render: () =>
        h(VueSegmentedSwitch, {
          value: value.value,
          options,
          role: 'group',
          onChange: change,
        }),
    });
    const host = document.createElement('div');
    document.body.append(host);
    app.mount(host);
    try {
      const buttons = host.querySelectorAll('button');
      buttons[2].click();
      await nextTick();
      expect(value.value).toBe('teams');
      expect(buttons[2].classList.contains('on')).toBe(true);
      expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
      buttons[2].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
      await nextTick();
      expect(value.value).toBe('trends');
      expect(document.activeElement).toBe(buttons[0]);
      buttons[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
      await nextTick();
      expect(value.value).toBe('teams');
      buttons[1].click();
      expect(change).toHaveBeenCalledTimes(3);
    } finally {
      app.unmount();
      host.remove();
    }
  });
});
