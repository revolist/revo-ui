// @vitest-environment happy-dom
/** @jsxImportSource preact */
import { h, render } from 'preact';
import { afterEach, describe, expect, it } from 'vitest';

import { ResourcePickerAvatar } from './resource-picker-avatar';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ResourcePickerAvatar', () => {
  it('uses a strong light foreground on dark saturated backgrounds', () => {
    const host = document.createElement('div');
    document.body.append(host);
    render(
      <ResourcePickerAvatar
        resource={{
          id: 'alex',
          name: 'Alex Kim',
          color: '#7c3aed',
        }}
      />,
      host,
    );

    expect(
      host
        .querySelector<HTMLElement>('.rv-resource-picker__avatar')
        ?.style.getPropertyValue('--rv-resource-picker-avatar-color'),
    ).toBe('#fff');
  });

  it('keeps a dark foreground on bright backgrounds', () => {
    const host = document.createElement('div');
    document.body.append(host);
    render(
      <ResourcePickerAvatar
        resource={{
          id: 'ravi',
          name: 'Ravi Patel',
          color: '#facc15',
        }}
      />,
      host,
    );

    expect(
      host
        .querySelector<HTMLElement>('.rv-resource-picker__avatar')
        ?.style.getPropertyValue('--rv-resource-picker-avatar-color'),
    ).toBe('#0f172a');
  });
});

it('uses black initials on medium gray where white and dark navy are both below 4.5:1', () => {
  const host = document.createElement('div');
  try {
    render(
      <ResourcePickerAvatar
        resource={{ id: 1, name: 'Alex Kim', color: '#7c7c7c' }}
      />,
      host,
    );
    expect(
      host
        .querySelector<HTMLElement>('.rv-resource-picker__avatar')
        ?.style.getPropertyValue('--rv-resource-picker-avatar-color'),
    ).toBe('#000');
  } finally {
    render(null, host);
  }
});
