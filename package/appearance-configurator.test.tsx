// @vitest-environment happy-dom
import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { expect, it, vi } from 'vitest';
import { AppearanceConfigurator } from './appearance-configurator';
it('renders translated controls and emits changes without owning grid state', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const change = vi.fn(),
    reset = vi.fn();
  const labels = {
    appearance: 'Aspect',
    density: 'Densité',
    columnLines: 'Colonnes',
    rowStripes: 'Bandes',
    columns: 'Colonnes',
    resizable: 'Redimensionner',
    movable: 'Déplacer',
    reset: 'Réinitialiser',
  };
  act(() =>
    render(
      <AppearanceConfigurator
        labels={labels}
        densityOptions={[
          { value: 'compact', label: 'Compact' },
          { value: 'large', label: 'Grand' },
        ]}
        state={{
          density: 'compact',
          columnLines: false,
          rowStripes: false,
          resizable: true,
          movable: false,
        }}
        onChange={change}
        onReset={reset}
      />,
      host,
    ),
  );
  const select = host.querySelector<HTMLElement>(
    '[role="combobox"][aria-label="Densité"]',
  )!;
  act(() => select.click());
  await vi.waitFor(() =>
    expect(document.querySelector('[role="option"]')).toBeTruthy(),
  );
  const option = [
    ...document.querySelectorAll<HTMLElement>('[role="option"]'),
  ].find((el) => el.textContent?.includes('Grand'))!;
  act(() => option.click());
  expect(change).toHaveBeenCalledWith({ density: 'large' });
  const toggle = host.querySelector<HTMLButtonElement>(
    '[role="switch"][aria-label="Colonnes"]',
  )!;
  act(() => toggle.click());
  expect(change).toHaveBeenCalledWith({ columnLines: true });
  act(() =>
    host
      .querySelector<HTMLButtonElement>('.rv-appearance-configurator__reset')!
      .click(),
  );
  expect(reset).toHaveBeenCalledOnce();
  act(() => render(null, host));
  host.remove();
});
