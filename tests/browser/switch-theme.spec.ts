import { expect, test } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

test('custom switch preview and exported preset stay in sync', async ({
  page,
}) => {
  await page.goto('/components/selection-controls/');
  const editor = page.locator('.switch-theme-editor');
  const customized = editor.getByRole('switch', { name: 'Customized' });
  const track = customized.locator('[data-part="track"]');
  await expect(track).toHaveCSS('width', '40px');
  await expect(track).toHaveCSS('background-color', 'rgb(109, 40, 217)');
  await editor.getByLabel('Track width').fill('48');
  await expect(track).toHaveCSS('width', '48px');
  const downloadPromise = page.waitForEvent('download');
  await editor.getByRole('button', { name: 'Download JSON' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let data = '';
  for await (const chunk of stream) data += chunk.toString();
  expect(JSON.parse(data).components.Switch.custom.tokens.trackWidth).toBe(
    '48px',
  );
  await customized.evaluate((element) =>
    element.style.setProperty('--rv-ui-switch-track-width', '52px'),
  );
  await expect(track).toHaveCSS('width', '52px');
});

test('component editor previews and exports a button theme', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  const editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('Button');
  await editor.getByLabel('variant').selectOption('primary');
  const button = page
    .locator('.catalog-example')
    .getByRole('button', { name: 'Primary', exact: true })
    .first();
  await expect(button).toHaveClass(/rv-theme-button/);
  await expect(button).toHaveCSS('background-color', 'rgb(109, 40, 217)');
  const downloadPromise = page.waitForEvent('download');
  await editor.getByRole('button', { name: 'Download JSON' }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  let data = '';
  for await (const chunk of stream) data += chunk.toString();
  const preset = JSON.parse(data).components.Button.custom;
  expect(preset.props.variant).toBe('primary');
  expect(preset.styles.root['--rv-ui-accent']).toBe('#6d28d9');
  expect(preset.className).toBe('rv-theme-button-custom');
});

test('previews a component inside a composed gallery example', async ({
  page,
}) => {
  await page.goto('/components/ai-assistant/');
  const editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('AiMessage');
  await expect(
    page.locator('.rv-ai-message.rv-theme-ai-message-custom').first(),
  ).toBeVisible();
  await expect(page.locator('.theme-preview-note')).toHaveCount(0);
});

test('copyable full source excludes gallery preview adapters', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  const example = page.locator('#example-button-variants');
  await example.getByRole('button', { name: 'View code' }).click();
  await example.getByRole('button', { name: 'Full source' }).click();
  const source = await example.locator('pre').innerText();
  expect(source).not.toContain('__themeOriginal_');
  expect(source).not.toContain('withThemePreview');
  expect(source).toContain("from '@revolist/ui/preact'");
});

test('saves presets from different families into one portable theme', async ({
  page,
}) => {
  await page.goto('/components/buttons/');
  let editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('Button');
  await editor.getByLabel('Preset name').fill('violet');
  await editor.getByLabel('variant').selectOption('primary');
  await editor.getByRole('button', { name: 'Save to theme' }).click();
  await expect(editor.getByText('Button / violet')).toBeVisible();

  await page.goto('/components/selection-controls/');
  editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('Switch');
  await editor.getByLabel('Preset name').fill('compact');
  await editor.getByRole('button', { name: 'Save to theme' }).click();
  const downloadPromise = page.waitForEvent('download');
  await editor.getByRole('button', { name: 'Download saved JSON' }).click();
  const stream = await (await downloadPromise).createReadStream();
  let data = '';
  for await (const chunk of stream) data += chunk.toString();
  const theme = JSON.parse(data);
  expect(theme.components.Button.violet.props.variant).toBe('primary');
  expect(theme.components.Switch.compact.className).toBe(
    'rv-theme-switch-compact',
  );
});

test('side-by-side samples apply the preset only to the customized control', async ({
  page,
}) => {
  await page.goto('/components/selection-controls/');
  const editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  for (const name of [
    'Checkbox',
    'ChoiceChip',
    'ChoiceChipInfoButton',
    'Switch',
  ]) {
    await editor.getByLabel('Component').selectOption(name);
    const samples = page.locator('.theme-samples');
    const presetClass = `rv-theme-${name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}-custom`;
    await expect(
      samples.locator('> div').first().locator(`.${presetClass}`),
    ).toHaveCount(0);
    await expect(
      samples.locator('> div').last().locator(`.${presetClass}`).first(),
    ).toBeVisible();
  }
});

test('number step preset changes only the customized sample behavior', async ({
  page,
}) => {
  await page.goto('/components/inputs-and-forms/');
  const editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('NumberStepper');
  await editor.getByLabel('step', { exact: true }).fill('3');
  const samples = page.locator('.theme-samples');
  const original = samples.locator('> div').first();
  const custom = samples.locator('> div').last();
  await original.getByRole('button', { name: 'Increase' }).click();
  await custom.getByRole('button', { name: 'Increase' }).click();
  await expect(
    original.getByRole('spinbutton', { name: 'Quantity' }),
  ).toHaveValue('2');
  await expect(
    custom.getByRole('spinbutton', { name: 'Quantity' }),
  ).toHaveValue('4');
});

test('building-block samples render their selected preset class', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const families: Record<string, string[]> = {
    'inputs-and-forms': [
      'Input',
      'DateInput',
      'TimeInput',
      'DateTimeInput',
      'FormField',
      'FieldError',
      'FormSection',
      'NumberInput',
      'HighlightedTextInput',
      'InlineFieldGroup',
      'MaskedDraft',
    ],
    layout: [
      'DisclosureSummary',
      'EditorPane',
      'EditorSplitLayout',
      'Disclosure',
      'Pane',
      'SplitLayout',
      'ResizeHandle',
    ],
    'ai-assistant': [
      'AiChatEmptyState',
      'AiPromptInput',
      'AiRequestTrail',
      'AiResultView',
      'AiActionStatus',
      'AiAssistant',
      'AiChat',
      'AiChatComposer',
      'AiChatContent',
      'AiMessage',
      'AiMessageActions',
      'AiMessageContent',
      'AiReasoning',
      'AiResult',
      'AiResultMetrics',
      'AiResultTable',
      'AiResultText',
      'AiSuggestions',
      'AiTask',
      'AiTaskItem',
    ],
    'field-configurators': [
      'FieldLibrary',
      'FieldLibraryList',
      'FieldRow',
      'FieldSummary',
      'ReorderList',
      'ReorderHandle',
      'FieldActions',
      'FieldContent',
      'FieldGroup',
      'FieldItem',
      'FieldList',
      'FieldRemoveButton',
      'FieldStatusBadge',
      'SelectedField',
    ],
    buttons: ['SvgIcon', 'ButtonGroup', 'IconButton', 'SvgButton'],
    pagination: ['Pagination'],
    'progress-and-rating': ['Rating'],
    'selection-controls': ['OptionButton'],
    'activity-messages': ['ActivityMessage'],
    'status-and-feedback': [
      'CountBadge',
      'Spinner',
      'LoadingOverlay',
      'EmptyState',
      'StatusBadge',
      'StatusFeedbackPanel',
    ],
    'menus-and-toolbars': [
      'Toolbar',
      'ToolbarGroup',
      'ToolbarSeparator',
      'Menu',
      'MenuItem',
      'MenuSeparator',
      'Submenu',
      'IconToolbar',
    ],
    'charts-and-range-selection': [
      'BrushRange',
      'DistributionChart',
      'AreaChart',
      'BarChart',
      'LineChart',
    ],
    'resource-selection': ['Avatar', 'ResourcePickerAvatar', 'SharedResourcePicker'],
    color: ['ColorPalette', 'ColorPicker'],
    accordion: ['CollapsibleSection'],
    'duration-and-effort': ['DurationField', 'DurationDraft'],
    'html-editor': ['HtmlEditor'],
    sliders: ['SliderField', 'SingleValueSlider', 'PreactRangeSlider'],
    'tabs-and-lists': [
      'EditorList',
      'EditorListGroup',
      'EditorListItem',
      'EditorListItemContent',
      'Listbox',
      'ListboxGroup',
      'ListboxOption',
      'ListboxOptionContent',
      'TabPanel',
    ],
    'calendar-and-dates': [
      'CalendarDay',
      'CalendarMonthGrid',
      'CalendarYearGrid',
      'CalendarHeader',
      'CalendarWeekdays',
      'Calendar',
      'CalendarPicker',
      'DatePicker',
      'DateRangePicker',
    ],
    'date-and-time-fields': ['DateTimeField', 'TemporalDraft', 'TemporalPicker'],
    'multi-selects-autocomplete': [
      'FilterChip',
      'DropdownPopupContent',
      'Select',
      'Combobox',
      'MultiSelect',
      'LookupField',
    ],
    'formatting-controls': [
      'FilterBadge',
      'FilterBadgeInfoButton',
      'ComparisonPreview',
      'IconChoiceGroup',
      'IconToggleButton',
      'InspectorSection',
      'TypographyControls',
    ],
    'weekly-time-grid': ['TimeGrid'],
    'dialogs-and-floating-surfaces': [
      'DialogHeader',
      'DialogBody',
      'DialogFooter',
      'DialogActions',
      'DialogCloseButton',
      'DialogTitleInput',
      'DialogActionFooter',
      'DialogForm',
      'EditableDialogHeader',
    ],
  };
  for (const [route, names] of Object.entries(families)) {
    await page.goto(`/components/${route}/`);
    const editor = page.locator('.theme-editor').first();
    await editor.locator('summary').first().click();
    for (const name of names) {
      await editor.getByLabel('Component').selectOption(name);
      const presetClass = `rv-theme-${name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}-custom`;
      const samples = page.locator('.theme-samples');
      await expect(
        samples.locator('> div').first().locator(`.${presetClass}`),
      ).toHaveCount(0);
      await expect(
        samples.locator('> div').last().locator(`.${presetClass}`).first(),
      ).toBeVisible();
    }
  }
});

test('popup and staged component samples apply their theme when opened', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const examples = [
    ['ai-assistant', 'AiChangePreview', 'Open preview'],
    ['multi-selects-autocomplete', 'DropdownPopup', 'Toggle popup'],
    ['assignee-field', 'AssigneePicker', 'Open picker'],
    ['assignee-field', 'AssigneePickerLayout', 'Open picker'],
    ['assignee-field', 'AssigneeField', 'Open assignees'],
    ['inputs-and-forms', 'NumberDraft', 'Edit number'],
    ['dialogs-and-floating-surfaces', 'Dialog', 'Open dialog'],
    ['dialogs-and-floating-surfaces', 'ConfirmDialog', 'Open confirmation'],
    ['dialogs-and-floating-surfaces', 'Popover', 'Toggle popover'],
    ['tooltip', 'ControlTooltip', 'Toggle tooltip'],
  ];
  for (const [route, name, trigger] of examples) {
    await page.goto(`/components/${route}/`);
    const editor = page.locator('.theme-editor').first();
    await editor.locator('summary').first().click();
    await editor.getByLabel('Component').selectOption(name);
    const sample = page.locator('.theme-samples > div').last();
    await sample.getByRole('button', { name: trigger }).click();
    const presetClass = `rv-theme-${name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}-custom`;
    await expect(page.locator(`.${presetClass}:visible`).first()).toBeVisible();
  }
});

test('PDF and timeline samples render themed components', async ({ page }) => {
  for (const [route, names] of [
    ['timeline-track', ['TimelineTrack']],
    ['tooltip', ['Tooltip']],
    ['pdf-viewer', ['PdfViewer', 'PdfViewerToolbar']],
  ] as const) {
    await page.goto(`/components/${route}/`);
    const editor = page.locator('.theme-editor').first();
    await editor.locator('summary').first().click();
    for (const name of names) {
      await editor.getByLabel('Component').selectOption(name);
      const presetClass = `rv-theme-${name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}-custom`;
      await expect(
        page
          .locator('.theme-samples > div')
          .last()
          .locator(`.${presetClass}`)
          .first(),
      ).toBeVisible();
    }
  }
});

test('shows live observed state hooks and resets samples when changing components', async ({
  page,
}) => {
  await page.goto('/components/selection-controls/');
  const editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('Switch');
  const sample = page.locator('.theme-samples > div').last();
  await sample.getByRole('switch', { name: 'Enabled' }).click();
  await expect(
    editor.locator('p').filter({ hasText: 'Observed states' }),
  ).toContainText('[data-state="unchecked"]');

  await page.goto('/components/assignee-field/');
  const selectEditor = page.locator('.theme-editor').first();
  await selectEditor.locator('summary').first().click();
  await selectEditor.getByLabel('Component').selectOption('AssigneePicker');
  await page
    .locator('.theme-samples > div')
    .last()
    .getByRole('button', { name: 'Open picker' })
    .click();
  await selectEditor
    .getByLabel('Component')
    .selectOption('AssigneePickerLayout');
  await expect(
    page
      .locator('.theme-samples > div')
      .last()
      .getByRole('button', { name: 'Open picker' }),
  ).toBeVisible();
});

test('every catalog sample renders its customized preset', async ({ page }) => {
  test.setTimeout(240_000);
  const { componentApi } = await import('../../scripts/component-api.mjs');
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const api: { name: string; families: string[] }[] = componentApi(root, root);
  const pages: { title: string }[] = JSON.parse(
    readFileSync(new URL('../../src/pages.json', import.meta.url), 'utf8'),
  ).components;
  const lazy: Record<string, string> = {
    AiChangePreview: 'Open preview',
    AssigneeField: 'Open assignees',
    AssigneePicker: 'Open picker',
    AssigneePickerLayout: 'Open picker',
    ConfirmDialog: 'Open confirmation',
    ControlTooltip: 'Toggle tooltip',
    Dialog: 'Open dialog',
    DropdownPopup: 'Toggle popup',
    NumberDraft: 'Edit number',
    Popover: 'Toggle popover',
  };
  const seen = new Set<string>();
  const hooks: Record<string, { parts: string[]; states: string[] }> = {};
  for (const family of pages) {
    const route = family.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await page.goto(`/components/${route}/`);
    const editor = page.locator('.theme-editor').first();
    await editor.locator('summary').first().click();
    const selector = editor.getByLabel('Component');
    const names = api
      .filter((item) => item.families.includes(family.title))
      .map((item) => item.name);
    await expect(selector.locator('option')).toHaveCount(names.length);
    for (const name of names) {
      if (seen.has(name)) continue;
      seen.add(name);
      await selector.selectOption(name);
      const sample = page.locator('.theme-samples > div').last();
      if (lazy[name])
        await sample.getByRole('button', { name: lazy[name] }).click();
      const presetClass = `rv-theme-${name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}-custom`;
      const surface = lazy[name]
        ? page.locator(`.${presetClass}:visible`)
        : sample.locator(`.${presetClass}`);
      await expect(surface.first(), `${name} theme surface`).toBeAttached();
      if (process.env.REVO_UI_HOOKS_OUTPUT) {
        const scoped = sample.locator(`.${presetClass}`);
        const roots = (await scoped.count()) ? scoped : surface;
        hooks[name] = await roots.evaluateAll((nodes) => {
          const parts = new Set<string>(),
            states = new Set<string>();
          const attrs = [
            'data-state',
            'data-tone',
            'data-selected',
            'data-filled',
            'data-active',
            'aria-checked',
            'aria-pressed',
            'aria-selected',
            'aria-expanded',
            'aria-busy',
          ];
          for (const root of nodes) {
            for (const node of [root, ...root.querySelectorAll('*')]) {
              const part = node.getAttribute('data-part');
              if (part) parts.add(part);
              for (const attr of attrs)
                if (node.hasAttribute(attr)) states.add(attr);
            }
          }
          return { parts: [...parts].sort(), states: [...states].sort() };
        });
      }
      if (lazy[name]) await page.keyboard.press('Escape');
    }
  }
  expect([...seen].sort()).toEqual(api.map((item) => item.name).sort());
  if (process.env.REVO_UI_HOOKS_OUTPUT)
    writeFileSync(
      process.env.REVO_UI_HOOKS_OUTPUT,
      JSON.stringify(hooks, null, 2) + '\n',
    );
});

test('structured part styles update the preview and travel in JSON', async ({
  page,
}) => {
  await page.goto('/components/selection-controls/');
  const editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('Switch');
  await editor.getByLabel('Part', { exact: true }).fill('thumb');
  await editor.getByLabel('CSS property').fill('background-color');
  await editor.getByLabel('CSS value').fill('rgb(255, 0, 0)');
  await editor.getByRole('button', { name: 'Add style' }).click();
  const samples = page.locator('.theme-samples > div');
  await expect(samples.last().locator('[data-part="thumb"]')).toHaveCSS(
    'background-color',
    'rgb(255, 0, 0)',
  );
  await expect(samples.first().locator('[data-part="thumb"]')).not.toHaveCSS(
    'background-color',
    'rgb(255, 0, 0)',
  );
  const downloadPromise = page.waitForEvent('download');
  await editor.getByRole('button', { name: 'Download JSON' }).click();
  const stream = await (await downloadPromise).createReadStream();
  let data = '';
  for await (const chunk of stream) data += chunk.toString();
  expect(
    JSON.parse(data).components.Switch.custom.styles.parts.thumb[
      'background-color'
    ],
  ).toBe('rgb(255, 0, 0)');
  await editor
    .getByRole('button', { name: 'Remove thumb background-color' })
    .click();
  await expect(samples.last().locator('[data-part="thumb"]')).not.toHaveCSS(
    'background-color',
    'rgb(255, 0, 0)',
  );
});

test('rating and slider behavior defaults work in the gallery', async ({
  page,
}) => {
  await page.goto('/components/progress-and-rating/');
  let editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('Rating');
  await editor.getByLabel('max', { exact: true }).fill('3');
  await expect(
    page.locator('.theme-samples > div').last().getByRole('radio'),
  ).toHaveCount(3);

  await page.goto('/components/sliders/');
  editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('SliderField');
  await editor
    .getByRole('combobox', { name: 'layout', exact: true })
    .selectOption('stacked');
  await editor
    .getByRole('combobox', { name: 'disabled', exact: true })
    .selectOption('true');
  await editor
    .getByRole('textbox', { name: 'accentColor', exact: true })
    .fill('#ff0000');
  const custom = page.locator('.theme-samples > div').last();
  await expect(custom.locator('.rv-slider-field--stacked')).toBeVisible();
  await expect(custom.locator('.rv-slider-field--stacked')).toHaveCSS(
    '--rv-slider-field-accent',
    '#ff0000',
  );
  await expect(custom.getByRole('slider')).toBeDisabled();
});

test('tooltip trigger can be configured in a preset', async ({ page }) => {
  await page.goto('/components/tooltip/');
  const editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('Tooltip');
  await editor
    .getByRole('combobox', { name: 'trigger', exact: true })
    .selectOption('click');
  const custom = page.locator('.theme-samples > div').last();
  await custom.getByRole('button', { name: 'Show tooltip' }).click();
  await expect(
    page.locator('.rv-tooltip.rv-theme-tooltip-custom:visible'),
  ).toHaveCount(1);
});

test('JSON behavior defaults preview and export for any component', async ({
  page,
}) => {
  await page.goto('/components/progress-and-rating/');
  const editor = page.locator('.theme-editor').first();
  await editor.locator('summary').first().click();
  await editor.getByLabel('Component').selectOption('ProgressBar');
  await editor.getByText('More behavior defaults (JSON)').click();
  await editor.getByLabel('Behavior defaults').fill('{"max":130}');
  await editor.getByRole('button', { name: 'Apply defaults' }).click();
  const samples = page.locator('.theme-samples > div');
  await expect(samples.first().getByRole('progressbar')).toHaveAttribute(
    'aria-valuemax',
    '100',
  );
  await expect(samples.last().getByRole('progressbar')).toHaveAttribute(
    'aria-valuemax',
    '130',
  );
  const downloadPromise = page.waitForEvent('download');
  await editor.getByRole('button', { name: 'Download JSON' }).click();
  const stream = await (await downloadPromise).createReadStream();
  let data = '';
  for await (const chunk of stream) data += chunk.toString();
  expect(JSON.parse(data).components.ProgressBar.custom.defaults.max).toBe(130);
  await expect(
    editor.locator('code').filter({ hasText: '<ProgressBar' }),
  ).toContainText('presetProps');
  await editor.getByLabel('Behavior defaults').fill('{"onClick":"invalid"}');
  await editor.getByRole('button', { name: 'Apply defaults' }).click();
  await expect(editor.getByRole('alert')).toContainText('event');
  await expect(samples.last().getByRole('progressbar')).toHaveAttribute(
    'aria-valuemax',
    '130',
  );
});

test('component API reference shows example styling hooks', async ({
  page,
}) => {
  await page.goto('/api/progressbar/');
  const reference = page.locator('.component-preset-reference');
  await expect(reference).toContainText('presetProps');
  await expect(reference).toContainText('[data-part="track"]');
  await expect(reference).toContainText('[data-part="fill"]');
  await expect(reference).toContainText('depend on configuration');
});
