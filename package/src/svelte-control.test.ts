import { describe, expect, it } from 'vitest';
import { rvControl } from './svelte-control';

const settled = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Svelte shared-control action', () => {
  it('retains native input binding and updates presentation after framework patches', async () => {
    const input = document.createElement('input');
    const action = rvControl(input);
    input.value = 'bound value';
    expect(input.value).toBe('bound value');
    input.type = 'checkbox';
    input.checked = true;
    input.className = 'consumer-class';
    await settled();
    expect(input.checked).toBe(true);
    expect(input.className).toBe('consumer-class rv-checkbox');
    expect(input.classList.contains('rv-control')).toBe(false);
    action.destroy();
    input.className = 'after-destroy';
    await settled();
    expect(input.className).toBe('after-destroy');
  });

  it('defaults action buttons while preserving form submission buttons', () => {
    const button = document.createElement('button');
    const submit = document.createElement('button');
    submit.type = 'submit';
    const action = rvControl(button);
    const submission = rvControl(submit);
    expect(button.type).toBe('button');
    expect(submit.type).toBe('submit');
    expect(button.classList.contains('rv-btn')).toBe(true);
    action.destroy();
    submission.destroy();
  });
});
