import { render } from 'preact';
import { afterEach, expect, it } from 'vitest';
import { AvatarElement, avatarTemplate } from './index';

afterEach(() => {
  document.body.replaceChildren();
});

it('keeps decorative avatar image paths out of surrounding option names', () => {
  const host = document.createElement('div');
  document.body.append(host);
  render(<AvatarElement options={{ value: '/sam.jpg', label: '' }} />, host);
  const avatar = host.firstElementChild!;
  expect(avatar.getAttribute('aria-hidden')).toBe('true');
  expect(avatar.getAttribute('title')).toBeNull();
  const template = avatarTemplate(
    (tag: string, props: Record<string, unknown>) => ({ tag, props }),
    { value: '/sam.jpg', label: '' },
  );
  expect(template.props['aria-hidden']).toBe(true);
  expect(template.props.title).toBeUndefined();
});

it('retains explicit accessible names for meaningful avatars', () => {
  const host = document.createElement('div');
  document.body.append(host);
  render(
    <AvatarElement
      options={{ value: '/sam.jpg', label: '', ariaLabel: 'Sam Rivera' }}
    />,
    host,
  );
  expect(host.firstElementChild!.getAttribute('aria-label')).toBe('Sam Rivera');
  expect(host.firstElementChild!.getAttribute('aria-hidden')).toBeNull();
});
