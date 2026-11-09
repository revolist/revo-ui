// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Switch } from '.';

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});

describe('Switch', () => {
  it('owns the shared accessible switch markup and state', () => {
    const host = document.createElement('div');
    const onChange = vi.fn();
    document.body.append(host);

    render(
      <Switch
        checked={false}
        label="Include blanks"
        className="consumer-layout"
        onChange={onChange}
      />,
      host,
    );

    const control = host.querySelector<HTMLButtonElement>('.rv-switch');
    expect(control?.classList.contains('consumer-layout')).toBe(true);
    expect(control?.getAttribute('role')).toBe('switch');
    expect(control?.getAttribute('aria-checked')).toBe('false');
    expect(control?.getAttribute('aria-label')).toBe('Include blanks');
    expect(
      control?.querySelector('.rv-switch-track .rv-switch-thumb'),
    ).toBeTruthy();

    control?.click();
    expect(onChange).toHaveBeenCalledWith(true);
    const keydown = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    control?.dispatchEvent(keydown);
    expect(keydown.defaultPrevented).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('supports trailing labels, disabled state, and native keyboard activation', () => {
    const host = document.createElement('div');
    const onChange = vi.fn();
    document.body.append(host);

    render(
      <Switch
        checked
        label="Rolling"
        labelPosition="after"
        disabled
        onChange={onChange}
      />,
      host,
    );

    const control = host.querySelector<HTMLButtonElement>('.rv-switch');
    expect(control?.disabled).toBe(true);
    expect(control?.querySelector('.rv-switch-label')?.textContent).toBe(
      'Rolling',
    );
    expect(
      control?.firstElementChild?.classList.contains('rv-switch-track'),
    ).toBe(true);
    control?.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });
});
