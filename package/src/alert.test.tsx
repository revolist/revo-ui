import { h, render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { Alert } from './controls';

afterEach(() => render(null, document.body));
it('keeps legacy alert content and tone announcement semantics', () => {
  render(
    <div>
      <Alert tone="success">Changes saved</Alert>
      <Alert tone="danger" label="Validation">
        Check this value
      </Alert>
    </div>,
    document.body,
  );
  expect(document.querySelector('[role="status"]')?.textContent).toBe(
    'Changes saved',
  );
  expect(
    document.querySelector('[role="alert"]')?.getAttribute('aria-label'),
  ).toBe('Validation');
});
it('composes a decorative icon, compact title and description without duplicate announcements', () => {
  render(
    <Alert
      tone="danger"
      title="Unable to save"
      description="Review the highlighted fields."
      icon={<svg />}
    />,
    document.body,
  );
  const alert = document.querySelector('[role="alert"]')!;
  expect(
    alert.querySelector('.rv-alert__icon')?.getAttribute('aria-hidden'),
  ).toBe('true');
  expect(alert.querySelector('.rv-alert__title')?.textContent).toBe(
    'Unable to save',
  );
  expect(alert.querySelector('.rv-alert__description')?.textContent).toBe(
    'Review the highlighted fields.',
  );
  expect(alert.querySelectorAll('[role="alert"]')).toHaveLength(0);
});

it('supports actions and host attributes without duplicating announcement roles', () => {
  render(
    <Alert
      tone="danger"
      data-chart-data-status=""
      className="host"
      actions={<button>Retry</button>}
    >
      Unavailable
    </Alert>,
    document.body,
  );
  const alert = document.querySelector('[data-chart-data-status]')!;
  expect(alert.classList.contains('host')).toBe(true);
  expect(alert.querySelector('.rv-alert__actions button')?.textContent).toBe(
    'Retry',
  );
  expect(document.querySelectorAll('[role="alert"]')).toHaveLength(1);
});

it('shares the complete alert composition with grid template renderers', async () => {
  const { renderAlert } = await import('./native');
  const renderer = (
    tag: string,
    attributes: any,
    children: any[] = [],
  ): any => ({ tag, attributes, children });
  const node = renderAlert(renderer, {
    tone: 'danger',
    className: 'consumer',
    id: 'validation',
    icon: '!',
    title: 'Unable to save',
    children: 'Review the values',
    actions: 'Retry',
  });
  expect(node.attributes).toMatchObject({ role: 'alert', id: 'validation' });
  expect(node.attributes.class).toContain('rv-alert--with-actions');
  expect(node.children.map((child: any) => child.attributes.class)).toEqual([
    'rv-alert__icon',
    'rv-alert__content',
    'rv-alert__actions',
  ]);
  expect(node.children[1].children[0].children).toEqual(['Unable to save']);
});
