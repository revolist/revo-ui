import { render, type ComponentChildren } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { DropdownPopup } from './popup';

const mounts: HTMLElement[] = [];
afterEach(() => {
  mounts.forEach((host) => act(() => render(null, host)));
  mounts.length = 0;
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
async function mount(trigger: HTMLDivElement, content: ComponentChildren) {
  const host = document.body.appendChild(document.createElement('div'));
  mounts.push(host);
  await act(async () => {
    render(
      <DropdownPopup triggerRef={{ current: trigger }}>
        {content}
      </DropdownPopup>,
      host,
    );
    await new Promise((resolve) => setTimeout(resolve, 25));
  });
  await vi.waitFor(() =>
    expect(
      host.querySelector<HTMLElement>('.revo-dropdown-menu')?.style.maxHeight,
    ).not.toBe(''),
  );
  return host.querySelector<HTMLElement>('.revo-dropdown-menu')!;
}
it('keeps native internal and owned descendant scrolling local but follows anchor-ancestor and window scrolling', async () => {
  const ancestor = document.body.appendChild(document.createElement('div'));
  const trigger = ancestor.appendChild(document.createElement('div'));
  let top = 100;
  const measure = vi
    .spyOn(trigger, 'getBoundingClientRect')
    .mockImplementation(() => new DOMRect(200, top, 160, 40));
  const popup = await mount(
    trigger,
    <div className="editor-body">
      <button aria-controls="owned-child">Options</button>
    </div>,
  );
  const body = popup.querySelector<HTMLElement>('.editor-body')!;
  const child = document.body.appendChild(document.createElement('div'));
  child.id = 'owned-child';
  body.scrollTop = 129.5;
  measure.mockClear();
  act(() => body.dispatchEvent(new Event('scroll')));
  expect(body.scrollTop).toBe(129.5);
  expect(measure).not.toHaveBeenCalled();
  act(() => child.dispatchEvent(new Event('scroll')));
  expect(measure).not.toHaveBeenCalled();
  top = 20;
  act(() => ancestor.dispatchEvent(new Event('scroll')));
  expect(measure).toHaveBeenCalled();
  await vi.waitFor(() => expect(popup.style.top).toBe('64px'));
  top = 40;
  measure.mockClear();
  act(() => window.dispatchEvent(new Event('scroll')));
  expect(measure).toHaveBeenCalled();
  await vi.waitFor(() => expect(popup.style.top).toBe('84px'));
});
it('still moves a nested popup when its anchor scrolls inside the parent popup body', async () => {
  const trigger = document.body.appendChild(document.createElement('div'));
  const outerMeasure = vi
    .spyOn(trigger, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(100, 20, 100, 20));
  const outer = await mount(
    trigger,
    <div className="editor-body">
      <div id="nested-trigger" />
    </div>,
  );
  const body = outer.querySelector<HTMLElement>('.editor-body')!;
  const nestedTrigger = body.querySelector<HTMLDivElement>('#nested-trigger')!;
  let top = 100;
  const nestedMeasure = vi
    .spyOn(nestedTrigger, 'getBoundingClientRect')
    .mockImplementation(() => new DOMRect(100, top, 100, 20));
  const nested = await mount(nestedTrigger, <button>Option</button>);
  outerMeasure.mockClear();
  nestedMeasure.mockClear();
  top = 60;
  act(() => body.dispatchEvent(new Event('scroll')));
  expect(outerMeasure).not.toHaveBeenCalled();
  expect(nestedMeasure).toHaveBeenCalled();
  await vi.waitFor(() => expect(nested.style.top).toBe('84px'));
});
