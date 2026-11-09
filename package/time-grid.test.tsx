import { h, render } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { TimeGrid, useTimeGridInteraction, timeGridCellKey } from './time-grid';
const days = [
  { weekday: 1, short: 'Mon', long: 'Monday' },
  { weekday: 2, short: 'Tue', long: 'Tuesday' },
];
function Harness({
  commit,
  disabled = false,
}: {
  commit: () => void;
  disabled?: boolean;
}) {
  const [cells, setCells] = useState(new Set<string>());
  const [focused, setFocused] = useState('1:0');
  const values = useRef(cells);
  values.current = cells;
  const matrixRef = useRef<HTMLDivElement>(null);
  const interaction = useTimeGridInteraction({
    days,
    matrixRef,
    onFocus: setFocused,
    onCommit: commit,
    disabled,
    onPaint: (day, hour, selected) => {
      const next = new Set(values.current);
      const key = timeGridCellKey(day, hour);
      if (selected) next.add(key);
      else next.delete(key);
      values.current = next;
      setCells(next);
    },
  });
  return (
    <TimeGrid
      days={days}
      cells={cells}
      focused={focused}
      weekendDays={[]}
      gridLabel="Availability"
      hourLabel={String}
      cellLabel={(day, start) => `${day.long} ${start}`}
      matrixRef={matrixRef}
      onFocus={setFocused}
      disabled={disabled}
      {...interaction}
    />
  );
}
afterEach(() => {
  act(() => render(null, document.body));
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});
it('paints multiple cells and commits once at the end of the gesture', () => {
  const commit = vi.fn();
  act(() => render(<Harness commit={commit} />, document.body));
  const first = document.querySelector<HTMLButtonElement>(
    '[data-time-cell="1:0"]',
  )!;
  const next = document.querySelector<HTMLButtonElement>(
    '[data-time-cell="1:2"]',
  )!;
  act(() => {
    first.dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, bubbles: true }),
    );
    next.dispatchEvent(new PointerEvent('pointerenter'));
  });
  expect(first.getAttribute('aria-selected')).toBe('true');
  expect(next.getAttribute('aria-selected')).toBe('true');
  expect(commit).not.toHaveBeenCalled();
  act(() => document.dispatchEvent(new PointerEvent('pointerup')));
  expect(commit).toHaveBeenCalledOnce();
});
it('moves focus by keyboard and releases document listeners on disposal', () => {
  const commit = vi.fn();
  const remove = vi.spyOn(document, 'removeEventListener');
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  act(() => render(<Harness commit={commit} />, document.body));
  const first = document.querySelector<HTMLButtonElement>(
    '[data-time-cell="1:0"]',
  )!;
  act(() =>
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(document.activeElement?.getAttribute('data-time-cell')).toBe('1:2');
  act(() =>
    first.dispatchEvent(
      new PointerEvent('pointerdown', { button: 0, bubbles: true }),
    ),
  );
  act(() => render(null, document.body));
  expect(remove).toHaveBeenCalledWith('pointerup', expect.any(Function));
  expect(remove).toHaveBeenCalledWith('pointercancel', expect.any(Function));
  document.dispatchEvent(new PointerEvent('pointerup'));
  expect(commit).not.toHaveBeenCalled();
});
it('keeps disabled slots inactive', () => {
  const commit = vi.fn();
  act(() => render(<Harness commit={commit} disabled />, document.body));
  document.querySelector<HTMLButtonElement>('button')!.click();
  expect(commit).not.toHaveBeenCalled();
});
