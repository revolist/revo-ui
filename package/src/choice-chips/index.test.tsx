// @vitest-environment happy-dom
import { h, render } from 'preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChoiceChips, ChoiceChipInfoButton } from '.';

afterEach(() => {
  render(null, document.body);
  document.body.replaceChildren();
});

describe('ChoiceChips', () => {
  it('owns accessible pressed choices and consumer layout hooks', () => {
    const host = document.createElement('div');
    const onChange = vi.fn();
    document.body.append(host);

    render(
      <ChoiceChips
        value="today"
        ariaLabel="Date presets"
        className="consumer-layout"
        appearance="outlined"
        scrollable
        options={[
          { value: 'last7', label: 'Last 7 days' },
          { value: 'today', label: 'Today' },
        ]}
        onChange={onChange}
      />,
      host,
    );

    const group = host.querySelector('.rv-choice-chips');
    const buttons = host.querySelectorAll<HTMLButtonElement>('.rv-choice-chip');
    expect(group?.classList.contains('consumer-layout')).toBe(true);
    expect(group?.classList.contains('rv-choice-chips--scrollable')).toBe(true);
    expect(group?.classList.contains('rv-choice-chips--outlined')).toBe(true);
    expect(group?.getAttribute('role')).toBe('group');
    expect(group?.getAttribute('aria-label')).toBe('Date presets');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');

    buttons[0].click();
    expect(onChange).toHaveBeenCalledWith(
      'last7',
      expect.objectContaining({ label: 'Last 7 days' }),
    );
  });

  it('supports soft, compact, multi-active and disabled choices', () => {
    const host = document.createElement('div');
    const onChange = vi.fn();
    document.body.append(host);

    render(
      <ChoiceChips
        value={['businessHours', 'nights']}
        ariaLabel="Time presets"
        size="small"
        options={[
          { value: 'businessHours', label: 'Business hours' },
          { value: 'weekends', label: 'Weekends', disabled: true },
          { value: 'nights', label: 'Nights', title: 'Select night hours' },
        ]}
        onChange={onChange}
      />,
      host,
    );

    const group = host.querySelector('.rv-choice-chips');
    const buttons = host.querySelectorAll<HTMLButtonElement>('.rv-choice-chip');
    expect(group?.classList.contains('rv-choice-chips--soft')).toBe(true);
    expect(group?.classList.contains('rv-choice-chips--small')).toBe(true);
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[2].title).toBe('Select night hours');
  });
});

it('keeps selection, info and removal as independent sibling buttons', () => {
  const select = vi.fn();
  const remove = vi.fn();
  render(
    <ChoiceChips
      ariaLabel="Choices"
      value="a"
      onChange={select}
      options={[
        {
          value: 'a',
          label: 'Alpha',
          info: <button aria-label="Alpha details">i</button>,
          onRemove: remove,
          removeLabel: 'Remove Alpha',
        },
      ]}
    />,
    document.body,
  );
  const chip = document.querySelector('.rv-choice-chip')!;
  expect(chip.tagName).toBe('SPAN');
  expect(chip.querySelector('button button')).toBeNull();
  chip
    .querySelector<HTMLButtonElement>('[aria-label="Alpha details"]')!
    .click();
  const removeButton = chip.querySelector<HTMLButtonElement>(
    '[aria-label="Remove Alpha"]',
  )!;
  expect(removeButton.classList.contains('rv-remove-button--compact')).toBe(
    true,
  );
  expect(removeButton.querySelector('svg')).not.toBeNull();
  expect(removeButton.title).toBe('Remove Alpha');
  removeButton.click();
  expect(remove).toHaveBeenCalledOnce();
  expect(select).not.toHaveBeenCalled();
  chip.querySelector<HTMLButtonElement>('.rv-choice-chip-label')!.click();
  expect(select).toHaveBeenCalledOnce();
});

it('forwards configured colors through the shared option and action variants', () => {
  render(
    <ChoiceChips
      ariaLabel="Colors"
      value="critical"
      onChange={() => {}}
      options={[
        {
          value: 'critical',
          label: 'Critical',
          color: '#dc2626',
          onRemove: () => {},
          removeLabel: 'Remove critical',
        },
      ]}
    />,
    document.body,
  );
  const chip = document.querySelector<HTMLElement>('.rv-choice-chip')!;
  expect(chip.style.getPropertyValue('--rv-choice-chip-color')).toBe('#dc2626');
  expect(chip.getAttribute('data-color')).toBe('true');
  expect(chip.getAttribute('data-selected')).toBe('true');
  expect(chip.querySelector('button button')).toBeNull();
});

it('renders the shared chip info action with a filled decorative SVG', () => {
  const onClick = vi.fn();
  render(
    <ChoiceChipInfoButton aria-label="Filter details" onClick={onClick} />,
    document.body,
  );
  const button = document.body.querySelector<HTMLButtonElement>('button')!;
  expect(button.getAttribute('aria-label')).toBe('Filter details');
  expect(button.querySelector('[aria-hidden="true"] svg path')).not.toBeNull();
  expect(button.textContent).not.toContain('ⓘ');
  button.click();
  expect(onClick).toHaveBeenCalledOnce();
});
