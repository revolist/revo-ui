import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { ResizeHandle } from './controls';

afterEach(() => act(() => render(null, document.body)));

it('continues dragging through controlled rerenders and stops on release', () => {
  function Example() {
    const [value, setValue] = useState(100);
    return (
      <ResizeHandle
        label="Width"
        value={value}
        min={80}
        max={200}
        onChange={(next) => setValue(next)}
      />
    );
  }
  act(() => render(<Example />, document.body));
  const handle = document.querySelector('[role="separator"]')!;
  act(() =>
    handle.dispatchEvent(
      new PointerEvent('pointerdown', {
        button: 0,
        pointerId: 1,
        clientX: 0,
        bubbles: true,
      }),
    ),
  );
  act(() =>
    document.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 20 }),
    ),
  );
  expect(handle.getAttribute('aria-valuenow')).toBe('120');
  act(() =>
    document.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 40 }),
    ),
  );
  expect(handle.getAttribute('aria-valuenow')).toBe('140');
  act(() =>
    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 })),
  );
  act(() =>
    document.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 1, clientX: 60 }),
    ),
  );
  expect(handle.getAttribute('aria-valuenow')).toBe('140');
});

it('reads external values and latest callbacks without retaining listeners after unmount', () => {
  const previous = vi.fn(),
    latest = vi.fn();
  act(() =>
    render(
      <ResizeHandle label="Width" value={100} onChange={previous} />,
      document.body,
    ),
  );
  act(() =>
    render(
      <ResizeHandle
        label="Width"
        value={160}
        min={100}
        max={170}
        direction="rtl"
        onChange={latest}
      />,
      document.body,
    ),
  );
  const handle = document.querySelector('[role="separator"]')!;
  act(() =>
    handle.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
    ),
  );
  expect(latest).toHaveBeenLastCalledWith(170);
  expect(previous).not.toHaveBeenCalled();
  act(() =>
    handle.dispatchEvent(
      new PointerEvent('pointerdown', {
        button: 0,
        pointerId: 2,
        clientX: 0,
        bubbles: true,
      }),
    ),
  );
  act(() =>
    document.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 2, clientX: 20 }),
    ),
  );
  expect(latest).toHaveBeenLastCalledWith(150);
  act(() =>
    document.dispatchEvent(
      new PointerEvent('pointermove', { pointerId: 2, clientX: -20 }),
    ),
  );
  expect(latest).toHaveBeenLastCalledWith(170);
  act(() => render(null, document.body));
  latest.mockClear();
  document.dispatchEvent(
    new PointerEvent('pointermove', { pointerId: 2, clientX: -20 }),
  );
  expect(latest).not.toHaveBeenCalled();
});
