import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { act } from 'preact/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiRequestTrail, type AiRequestTrailItem } from './request-trail';

const items = [
  { id: '1', label: 'Amount above 1000' },
  { id: '2', label: 'Only Europe' },
  { id: '3', label: 'Highest amount first' },
];
afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});
function createHost() {
  const host = document.createElement('div');
  document.body.append(host);
  return host;
}
async function openTrail(host: HTMLElement) {
  await act(() =>
    host.querySelector<HTMLButtonElement>('.rv-ai-trail-trigger')!.click(),
  );
}
describe('AI applied request trail', () => {
  it('starts collapsed, opens a named popup and returns focus on Escape', async () => {
    const host = createHost();
    await act(() =>
      render(
        <AiRequestTrail items={items} onRemove={() => {}} onClear={() => {}} />,
        host,
      ),
    );
    const trigger = host.querySelector<HTMLButtonElement>(
      '.rv-ai-trail-trigger',
    )!;
    const panel = host.querySelector<HTMLDivElement>('[role="dialog"]')!;
    expect(trigger.textContent).toBe('');
    expect(trigger.getAttribute('aria-label')).toBe('Request history');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
    await openTrail(host);
    expect(panel.hidden).toBe(false);
    expect(panel.getAttribute('aria-label')).toBe('Request history');
    expect(document.activeElement).toBe(panel);
    await act(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      ),
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
    render(null, host);
  });
  it('does not steal focus during a later update after a failed removal', async () => {
    const host = createHost();
    vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(
      () => {},
    );
    const view = (steps: AiRequestTrailItem[], disabled = false) => (
      <AiRequestTrail
        items={steps}
        onRemove={() => {}}
        onClear={() => {}}
        disabled={disabled}
      />
    );
    await act(() => render(view(items), host));
    await openTrail(host);
    const remove = host.querySelector<HTMLButtonElement>('.rv-remove-button')!;
    remove.focus();
    await act(() => remove.click());
    await act(() => render(view(items, true), host));
    await act(() => render(view(items), host));
    remove.blur();
    await act(() => render(view([{ id: 'new', label: 'New request' }]), host));
    expect(document.activeElement).toBe(document.body);
    render(null, host);
  });
  it('counts grouped requests, labels removal actions and exposes ordered steps', async () => {
    const host = createHost();
    const remove = vi.fn();
    const clear = vi.fn();
    render(
      <AiRequestTrail
        items={[
          { id: 'older', label: '3 earlier requests', count: 3 },
          items[2],
        ]}
        onRemove={remove}
        onClear={clear}
      />,
      host,
    );
    await openTrail(host);
    expect(
      host.querySelector('.rv-ai-trail-steps')!.getAttribute('aria-label'),
    ).toBe('4 applied requests');
    expect(
      [...host.querySelectorAll('.rv-ai-step-number')].map(
        (node) => node.textContent,
      ),
    ).toEqual(['1–3', '4']);
    host
      .querySelector<HTMLButtonElement>(
        '[aria-label="Remove request: Highest amount first"]',
      )!
      .click();
    expect(remove).toHaveBeenCalledExactlyOnceWith('3');
    host
      .querySelector<HTMLButtonElement>('.rv-ai-trail-footer button')!
      .click();
    expect(clear).toHaveBeenCalledTimes(1);
    render(null, host);
  });
  it('blocks busy actions and keeps clear available when stale removals are unavailable', async () => {
    const host = createHost();
    const remove = vi.fn();
    const clear = vi.fn();
    render(
      <AiRequestTrail
        items={items}
        onRemove={remove}
        onClear={clear}
        disabled
      />,
      host,
    );
    for (const button of host.querySelectorAll('button')) {
      expect(button.disabled).toBe(true);
      button.click();
    }
    expect(remove).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
    render(
      <AiRequestTrail
        items={items}
        onRemove={remove}
        onClear={clear}
        removalsDisabled
      />,
      host,
    );
    await openTrail(host);
    expect(
      host.querySelector<HTMLButtonElement>('.rv-ai-trail-footer button')!
        .disabled,
    ).toBe(false);
    expect(
      [...host.querySelectorAll<HTMLButtonElement>('.rv-remove-button')].every(
        (button) => button.disabled,
      ),
    ).toBe(true);
    render(null, host);
  });
  it('moves focus to the next step after removal and returns to the draft after clearing', async () => {
    const host = createHost();
    const input = document.createElement('input');
    document.body.append(input);
    vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(
      () => {},
    );
    function View() {
      const [steps, setSteps] = useState<AiRequestTrailItem[]>(items);
      return (
        <AiRequestTrail
          items={steps}
          onRemove={(id) =>
            setSteps((current) => current.filter((item) => item.id !== id))
          }
          onClear={() => setSteps([])}
          onEmpty={() => input.focus()}
        />
      );
    }
    await act(() => render(<View />, host));
    await openTrail(host);
    const remove = host.querySelector<HTMLButtonElement>(
      '[aria-label="Remove request: Only Europe"]',
    )!;
    remove.focus();
    await act(() => remove.click());
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'Remove request: Highest amount first',
    );
    const clear = host.querySelector<HTMLButtonElement>(
      '.rv-ai-trail-footer button',
    )!;
    clear.focus();
    await act(() => clear.click());
    expect(document.activeElement).toBe(input);
    expect(host.textContent).toBe('');
    render(null, host);
  });
});

it('shows plugin action steps without offering unsafe selective removal', async () => {
  const host = createHost(),
    onRemove = vi.fn();
  await act(() =>
    render(
      <AiRequestTrail
        items={[
          { id: '1', label: 'Show dashboard', removable: false },
          { id: '2', label: 'Only Europe' },
        ]}
        onRemove={onRemove}
        onClear={() => {}}
      />,
      host,
    ),
  );
  await openTrail(host);
  expect(
    host.querySelector('.rv-ai-trail-trigger')?.getAttribute('aria-label'),
  ).toBe('Request history');
  const rows = host.querySelectorAll('.rv-ai-step');
  expect(rows[0].textContent).toContain('Show dashboard');
  expect(rows[0].querySelector('button')).toBeNull();
  await act(() => rows[1].querySelector('button')!.click());
  expect(onRemove).toHaveBeenCalledWith('2');
  render(null, host);
});

it('returns focus to the steps trigger when only informational requests remain', async () => {
  const host = createHost();
  function Example() {
    const [entries, setEntries] = useState<AiRequestTrailItem[]>([
      { id: '1', label: 'Show chart', removable: false },
      { id: '2', label: 'Only Europe' },
    ]);
    return (
      <AiRequestTrail
        items={entries}
        onRemove={(id) =>
          setEntries(entries.filter((entry) => entry.id !== id))
        }
        onClear={() => {}}
      />
    );
  }
  await act(() => render(<Example />, host));
  await openTrail(host);
  const remove = host.querySelector<HTMLButtonElement>(
    '.rv-ai-step .rv-remove-button',
  )!;
  await act(() => {
    remove.focus();
    remove.click();
  });
  expect(host.querySelectorAll('.rv-ai-step')).toHaveLength(1);
  expect(document.activeElement).toBe(
    host.querySelector('.rv-ai-trail-trigger'),
  );
  render(null, host);
});
