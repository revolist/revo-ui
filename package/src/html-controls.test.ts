import { expect, it, vi } from 'vitest';
import { applyControlPresentation } from './html-controls';

it('retains native values, refs, handlers and explicit form semantics', () => {
  const root = document.createElement('div');
  root.innerHTML =
    '<button class="local">Run</button><button type="submit">Save</button><input value="initial"><select><option value="one">One</option></select><textarea>Draft</textarea>';
  const button = root.querySelector('button')!;
  const input = root.querySelector('input')!;
  input.value = 'edited';
  const click = vi.fn();
  button.addEventListener('click', click);
  applyControlPresentation(root);
  expect(root.querySelector('button')).toBe(button);
  expect(button.className).toBe('rv-btn local');
  expect(button.type).toBe('button');
  expect(root.querySelectorAll('button')[1].type).toBe('submit');
  expect(input.value).toBe('edited');
  expect(root.querySelector('textarea')!.value).toBe('Draft');
  expect(root.querySelector('select')!.className).toBe('rv-control');
  button.click();
  expect(click).toHaveBeenCalledOnce();
});

it('styles the root control and updates types idempotently without stale classes', () => {
  const input = document.createElement('input');
  applyControlPresentation(input);
  expect(input.className).toBe('rv-control');
  input.type = 'checkbox';
  input.checked = true;
  applyControlPresentation(input);
  applyControlPresentation(input);
  expect(input.className).toBe('rv-checkbox');
  expect(input.checked).toBe(true);
  input.type = 'hidden';
  applyControlPresentation(input);
  expect(input.className).toBe('');
});

it('supports subsequent toolbar HTML replacement without observers or stale nodes', () => {
  const root = document.createElement('div');
  root.innerHTML =
    '<input type="radio"><input type="range"><details><summary>Options</summary></details>';
  applyControlPresentation(root);
  expect(root.querySelector('[type=radio]')!.className).toBe('rv-radio');
  expect(root.querySelector('[type=range]')!.className).toBe(
    'rv-native-slider',
  );
  expect(root.querySelector('summary')!.className).toBe(
    'rv-disclosure-summary',
  );
  root.innerHTML = '<input type="checkbox" disabled>';
  applyControlPresentation(root);
  expect(root.querySelector('input')!.className).toBe('rv-checkbox');
  expect(root.querySelector('input')!.disabled).toBe(true);
});
