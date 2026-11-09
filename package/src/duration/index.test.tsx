/** @jsxRuntime automatic */
/** @jsxImportSource preact */
import { dropdownOptions } from '../../../tests/helpers/dropdown.mjs';
import { render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { EditorCommitContext, type EditorCommit } from '../core/editor-commit';
import { DurationDraft, DurationField } from './index';
const host = document.createElement('div');
document.body.append(host);
afterEach(() => act(() => render(null, host)));
it('stages an authored unit and commits only on Apply', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <DurationDraft
        value="2d"
        options={{ defaultUnit: 'hour', autoApply: false }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const input = host.querySelector('input')!;
  await act(async () => {
    input.value = '90min';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Apply')!
      .click(),
  );
  expect(apply).toHaveBeenCalledExactlyOnceWith({
    value: 90,
    unit: 'minute',
    elapsed: false,
  });
});
it('forwards invalid raw product drafts without emitting a parsed value', async () => {
  const change = vi.fn(),
    raw = vi.fn();
  await act(async () =>
    render(
      <DurationField
        value="2d"
        defaultUnit="day"
        onChange={change}
        onDraftChange={raw}
      />,
      host,
    ),
  );
  await act(async () => {
    const input = host.querySelector('input')!;
    input.value = '-3h';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(raw).toHaveBeenLastCalledWith('-3h');
  expect(change).not.toHaveBeenCalled();
  expect(host.querySelector('input')?.getAttribute('aria-invalid')).toBe(
    'true',
  );
});

it('uses the shared slider and unit buttons without committing until Apply', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <DurationDraft
        value="2d"
        options={{
          autoApply: false,
          defaultUnit: 'hour',
          allowedUnits: ['hour', 'day'],
          slider: { max: 20, step: 0.25 },
          unitButtons: true,
        }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const slider = host.querySelector('input[type="range"]') as HTMLInputElement;
  expect(slider.classList.contains('rv-single-slider')).toBe(true);
  expect(slider.step).toBe('0.25');
  await act(async () => {
    slider.value = '3.5';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () =>
    (
      host.querySelector(
        '[role="radio"][aria-label="hour"]',
      ) as HTMLButtonElement
    ).click(),
  );
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Apply')!
      .click(),
  );
  expect(apply).toHaveBeenLastCalledWith({
    value: 3.5,
    unit: 'hour',
    elapsed: false,
  });
});
it('supports elapsed modes, input-only presentation and read-only controls', async () => {
  const change = vi.fn();
  await act(async () =>
    render(
      <DurationField
        value="2h"
        defaultUnit="hour"
        allowElapsed
        slider
        unitButtons
        onChange={change}
      />,
      host,
    ),
  );
  await act(async () =>
    [...host.querySelectorAll('[role="radio"]')]
      .find((button) => button.textContent === 'Elapsed')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true })),
  );
  expect(change).toHaveBeenLastCalledWith({
    value: 2,
    unit: 'hour',
    elapsed: true,
  });
  await act(async () =>
    render(
      <DurationField
        value="2h"
        defaultUnit="hour"
        slider
        unitButtons
        readOnly
        onChange={change}
      />,
      host,
    ),
  );
  expect(
    (host.querySelector('input[type="range"]') as HTMLInputElement).disabled,
  ).toBe(true);
  expect(
    [...host.querySelectorAll('button')].every((button) => button.disabled),
  ).toBe(true);
  await act(async () =>
    render(
      <DurationField value="2h" defaultUnit="hour" onChange={change} />,
      host,
    ),
  );
  expect(host.querySelector('input[type="range"]')).toBeNull();
  expect(host.querySelector('[role="radiogroup"]')).toBeNull();
});
it('keeps bare numeric entry in the selected unit', async () => {
  const change = vi.fn();
  await act(async () =>
    render(
      <DurationField
        value="2h"
        defaultUnit="hour"
        allowedUnits={['hour', 'day']}
        unitButtons
        onChange={change}
      />,
      host,
    ),
  );
  await act(async () =>
    (
      host.querySelector(
        '[role="radio"][aria-label="day"]',
      ) as HTMLButtonElement
    ).click(),
  );
  const input = host.querySelector('input[type="text"]') as HTMLInputElement;
  await act(async () => {
    input.value = '3';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(change).toHaveBeenLastCalledWith({
    value: 3,
    unit: 'day',
    elapsed: false,
  });
});
it('respects validation bounds and leaves invalid typed drafts intact', async () => {
  const change = vi.fn();
  await act(async () =>
    render(
      <DurationField
        value="2h"
        defaultUnit="hour"
        slider={{ max: 100 }}
        min={1}
        max={4}
        unitButtons
        onChange={change}
      />,
      host,
    ),
  );
  const slider = host.querySelector('input[type="range"]') as HTMLInputElement;
  expect(slider.min).toBe('1');
  expect(slider.max).toBe('4');
  const input = host.querySelector('input[type="text"]') as HTMLInputElement;
  await act(async () => {
    input.value = '-2h';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(input.value).toBe('-2h');
  expect(slider.disabled).toBe(true);
  expect(change).not.toHaveBeenCalled();
});
it('switches from buttons to a shared dropdown above five units and preserves elapsed values', async () => {
  const change = vi.fn();
  const five = ['minute', 'hour', 'day', 'week', 'month'] as const;
  await act(async () =>
    render(
      <DurationField
        value="3 elapsed hours"
        defaultUnit="hour"
        allowElapsed
        unitButtons
        allowedUnits={five}
        onChange={change}
      />,
      host,
    ),
  );
  expect(
    host.querySelectorAll('[aria-label="Duration unit"] [role="radio"]'),
  ).toHaveLength(5);
  expect(host.querySelector('select')).toBeNull();
  await act(async () =>
    render(
      <DurationField
        value="3 elapsed hours"
        defaultUnit="hour"
        allowElapsed
        unitButtons
        allowedUnits={[...five, 'year']}
        onChange={change}
      />,
      host,
    ),
  );
  const select = host.querySelector<HTMLElement>('[role=combobox]')!;
  expect(select.textContent).toContain('hour');
  const options = await dropdownOptions(select);
  expect(options).toHaveLength(6);
  await act(async () =>
    options.find((option) => option.textContent?.trim() === 'day')!.click(),
  );
  expect(
    host.querySelector('[role="radiogroup"][aria-label="Duration unit"]'),
  ).toBeNull();

  expect(change).toHaveBeenLastCalledWith({
    value: 3,
    unit: 'day',
    elapsed: true,
  });
  await act(async () =>
    render(
      <DurationField
        value="3h"
        defaultUnit="hour"
        unitButtons
        readOnly
        onChange={change}
      />,
      host,
    ),
  );
  expect(select.getAttribute('aria-disabled')).toBe('true');
});

it('clears an invalid draft when the initial value is already null', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <DurationDraft
        value={null}
        options={{ defaultUnit: 'hour', autoApply: false }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const input = host.querySelector('input')!;
  await act(async () => {
    input.value = 'invalid';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Clear')!
      .click(),
  );
  expect(host.querySelector('input')!.value).toBe('');
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Apply')!
      .click(),
  );
  expect(apply).toHaveBeenCalledExactlyOnceWith(null);
});
it('uses translated unit labels for button accessibility too', async () => {
  await act(async () =>
    render(
      <DurationField
        value="2h"
        defaultUnit="hour"
        allowedUnits={['hour', 'day']}
        unitButtons
        unitLabels={{ hour: 'heure', day: 'jour' }}
        onChange={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelector('[role="radio"][aria-label="heure"]')).toBeTruthy();
});

it('keeps the slider usable with non-finite display settings', async () => {
  await act(async () =>
    render(
      <DurationField
        value="2h"
        defaultUnit="hour"
        slider={{ max: Infinity, step: NaN }}
        onChange={() => {}}
      />,
      host,
    ),
  );
  const slider = host.querySelector('input[type="range"]')!;
  expect(slider.getAttribute('max')).toBe('100');
  expect(slider.getAttribute('step')).toBe('1');
});
it('deduplicates configured unit choices and omits an empty selector', async () => {
  await act(async () =>
    render(
      <DurationField
        value={null}
        defaultUnit="hour"
        allowedUnits={['hour', 'hour', 'day']}
        unitButtons
        onChange={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelectorAll('[role="radio"]')).toHaveLength(2);
  await act(async () =>
    render(
      <DurationField
        value={null}
        defaultUnit="hour"
        allowedUnits={[]}
        unitButtons
        onChange={() => {}}
      />,
      host,
    ),
  );
  expect(host.querySelector('[role="radiogroup"]')).toBeNull();
});

it('localizes presentation while preserving canonical unit expressions and structured values', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <DurationDraft
        value="2h"
        options={{
          autoApply: false,
          defaultUnit: 'hour',
          unitButtons: true,
          slider: true,
          allowElapsed: true,
          label: 'Durée',
          unitLabel: 'Unité',
          modeLabel: 'Mode de durée',
          workingLabel: 'Travail',
          elapsedLabel: 'Écoulé',
          invalidText: 'Durée invalide',
          unitLabels: { hour: 'heure', day: 'jour' },
          actions: { apply: 'Valider', cancel: 'Annuler', clear: 'Effacer' },
        }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const select = host.querySelector<HTMLElement>('[role=combobox]')!;
  expect(select.getAttribute('aria-label')).toBe('Unité');
  expect(select.textContent).toContain('heure');
  expect(
    host.querySelector('input[type="range"]')?.getAttribute('aria-label'),
  ).toBe('Durée');
  expect(
    host.querySelector('[aria-label="Mode de durée"]')?.textContent,
  ).toContain('Écoulé');
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Valider')!
      .click(),
  );
  expect(apply).toHaveBeenLastCalledWith({
    value: 2,
    unit: 'hour',
    elapsed: false,
  });
});
it('keeps required drafts uncleared and preserves an amount outside the slider display limit', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <DurationDraft
        value={{ value: 200.125, unit: 'hour', elapsed: false }}
        options={{
          autoApply: false,
          defaultUnit: 'hour',
          required: true,
          slider: { max: 100 },
          maximumFractionDigits: 3,
        }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('button')].some(
      (button) => button.textContent === 'Clear',
    ),
  ).toBe(false);
  expect(
    (host.querySelector('input[type="text"]') as HTMLInputElement).value,
  ).toBe('200.125 hours');
  await act(async () =>
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent === 'Apply')!
      .click(),
  );
  expect(apply).toHaveBeenLastCalledWith({
    value: 200.125,
    unit: 'hour',
    elapsed: false,
  });
});

it('auto-applies a valid completed input without saving partial typing or invalid drafts', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <DurationDraft
        value="2h"
        options={{ defaultUnit: 'hour' }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  expect(
    [...host.querySelectorAll('button')].map((button) => button.textContent),
  ).toEqual(['Clear']);
  const input = host.querySelector('input')!;
  await act(async () => {
    input.value = '90min';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        isComposing: true,
        bubbles: true,
      }),
    ),
  );
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    ),
  );
  expect(apply).toHaveBeenCalledExactlyOnceWith({
    value: 90,
    unit: 'minute',
    elapsed: false,
  });
  apply.mockClear();
  await act(async () => {
    input.value = '-3h';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
  expect(apply).not.toHaveBeenCalled();
});
it('stages slider releases and unit selection until Enter', async () => {
  const apply = vi.fn();
  await act(async () =>
    render(
      <DurationDraft
        value="2h"
        options={{
          defaultUnit: 'hour',
          slider: true,
          unitButtons: true,
          allowedUnits: ['hour', 'day'],
        }}
        apply={apply}
        cancel={() => {}}
      />,
      host,
    ),
  );
  const slider = host.querySelector('input[type="range"]') as HTMLInputElement;
  await act(async () => {
    slider.value = '4';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    slider.dispatchEvent(new Event('change', { bubbles: true })),
  );
  expect(apply).not.toHaveBeenCalled();
  await act(async () =>
    (
      host.querySelector(
        '[role="radio"][aria-label="day"]',
      ) as HTMLButtonElement
    ).click(),
  );
  expect(apply).not.toHaveBeenCalled();
  const input = host.querySelector('input[type="text"]')!;
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    ),
  );
  expect(apply).toHaveBeenCalledExactlyOnceWith({
    value: 4,
    unit: 'day',
    elapsed: false,
  });
});

it('validates the current raw duration before dismissal and commits a complete value only once', async () => {
  const apply = vi.fn();
  let commit: EditorCommit | undefined;
  await act(async () =>
    render(
      <EditorCommitContext.Provider
        value={(next) => {
          commit = next;
          return () => {
            commit = undefined;
          };
        }}
      >
        <DurationDraft
          value="2h"
          options={{ defaultUnit: 'hour' }}
          apply={apply}
          cancel={() => {}}
        />
      </EditorCommitContext.Provider>,
      host,
    ),
  );
  expect(commit?.()).toBe(true);
  expect(apply).not.toHaveBeenCalled();
  const input = host.querySelector('input')!;
  await act(async () => {
    input.value = '-2h';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(commit?.()).toBe(false);
  expect(apply).not.toHaveBeenCalled();
  await act(async () => {
    input.value = '3.5d';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(commit?.()).toBe(true);
  expect(apply).toHaveBeenCalledExactlyOnceWith({
    value: 3.5,
    unit: 'day',
    elapsed: false,
  });
  commit?.();
  expect(apply).toHaveBeenCalledTimes(1);
});
