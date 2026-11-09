import { h, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { ViewSwitcherControls } from './view-switcher';
afterEach(() => act(() => render(null, document.body)));
it('shares selection and Back callbacks and disables transitions while busy', () => {
  const onSelect = vi.fn(),
    onBack = vi.fn();
  const props = {
    value: 'grid',
    views: [
      { id: 'grid', label: 'Grid' },
      { id: 'chart', label: 'Chart' },
    ],
    canGoBack: true,
    onSelect,
    onBack,
  };
  act(() => render(<ViewSwitcherControls {...props} />, document.body));
  act(() =>
    [...document.querySelectorAll('button')]
      .find((button) => button.textContent === 'Chart')!
      .click(),
  );
  expect(onSelect).toHaveBeenCalledWith('chart', expect.anything());
  act(() =>
    [...document.querySelectorAll('button')]
      .find((button) => button.textContent === 'Back')!
      .click(),
  );
  expect(onBack).toHaveBeenCalledOnce();
  act(() =>
    render(
      <ViewSwitcherControls {...props} busy error="Needs fields" />,
      document.body,
    ),
  );
  expect(
    [...document.querySelectorAll('button')].every((button) => button.disabled),
  ).toBe(true);
  expect(document.querySelector('[role=alert]')?.textContent).toBe(
    'Needs fields',
  );
});

it('switches Data Grid and the latest control while retaining both options', () => {
  const onSelect = vi.fn();
  const props = {
    value: 'gantt',
    controlView: 'gantt',
    views: [
      { id: 'grid', label: 'Data Grid' },
      { id: 'gantt', label: 'Gantt' },
      { id: 'schedule', label: 'Schedule' },
    ],
    onSelect,
    onBack: vi.fn(),
    showViews: false,
  };
  act(() => render(<ViewSwitcherControls {...props} />, document.body));
  expect(
    [...document.querySelectorAll('[role=radio]')].map(
      (button) => button.textContent,
    ),
  ).toEqual(['Data Grid', 'Gantt']);
  act(() => document.querySelector<HTMLButtonElement>('[role=radio]')!.click());
  expect(onSelect).toHaveBeenCalledWith('grid', expect.anything());
  act(() =>
    render(<ViewSwitcherControls {...props} value="grid" />, document.body),
  );
  expect(document.querySelectorAll('[role=radio]')).toHaveLength(2);
  expect(
    document.querySelector('[role=radio]')?.getAttribute('aria-checked'),
  ).toBe('true');
  act(() =>
    render(
      <ViewSwitcherControls
        {...props}
        value="schedule"
        controlView="schedule"
      />,
      document.body,
    ),
  );
  expect(
    [...document.querySelectorAll('[role=radio]')].map(
      (button) => button.textContent,
    ),
  ).toEqual(['Data Grid', 'Schedule']);
});

it('translates default control labels, view names and errors', () => {
  const props = {
    value: 'pivot',
    views: [{ id: 'pivot', label: 'Pivot' }],
    onSelect: vi.fn(),
    onBack: vi.fn(),
    canGoBack: true,
    translations: {
      'Report view': 'Vue du rapport',
      Back: 'Retour',
      'Data Grid': 'Données',
      Pivot: 'Synthèse',
      'No previous view.': 'Aucune vue précédente.',
    },
  };
  act(() =>
    render(
      <ViewSwitcherControls {...props} error="No previous view." />,
      document.body,
    ),
  );
  expect(
    document.querySelector('[role=radiogroup]')?.getAttribute('aria-label'),
  ).toBe('Vue du rapport');
  expect(document.body.textContent).toContain('Synthèse');
  expect(document.body.textContent).toContain('Retour');
  expect(document.querySelector('[role=alert]')?.textContent).toBe(
    'Aucune vue précédente.',
  );
  act(() =>
    render(
      <ViewSwitcherControls {...props} showViews={false} />,
      document.body,
    ),
  );
  expect(document.querySelector('button')?.textContent).toBe('Données');
});
