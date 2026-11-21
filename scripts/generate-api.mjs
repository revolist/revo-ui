import ts from 'typescript';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const gallery = fileURLToPath(new URL('../', import.meta.url));
const library = resolve(process.argv[2] ?? gallery);
const catalogPath = resolve(library, 'package/component-catalog.ts');
const selectPath = resolve(library, 'package/select.tsx');
const program = ts.createProgram([catalogPath, selectPath], {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  jsxImportSource: 'preact',
  skipLibCheck: true,
  strict: true,
  allowSyntheticDefaultImports: true,
});
const checker = program.getTypeChecker();
const groups = JSON.parse(
  readFileSync(resolve(gallery, 'docs/component-groups.json'), 'utf8'),
);
// The first family is canonical, matching the API index and live reference.
const routes = new Map();
for (const [title, route, description, names] of groups) {
  for (const name of names.split(' ')) {
    if (!routes.has(name)) routes.set(name, { title, route, description });
  }
}
routes.set('FileTree', {
  route: 'tree',
  anchor: 'example-changed-files',
  description:
    'Browse nested files and folders, select paths, and show file changes.',
});
routes.set('Stepper', {
  route: 'stepper',
  description:
    'Show progress and guide users through a workflow with optional inline panels.',
});
routes.set('Select', {
  title: 'Multi/selects, autocomplete',
  route: 'multi-selects-autocomplete',
  description: 'JSX option descriptors for the shared dropdown.',
});
const source = program.getSourceFile(catalogPath);
let initializer;
for (const statement of source.statements)
  if (ts.isVariableStatement(statement)) {
    for (const declaration of statement.declarationList.declarations)
      if (declaration.name.getText(source) === 'uiComponents')
        initializer = declaration.initializer;
  }
while (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer))
  initializer = initializer.expression;
const entries = initializer.properties.map((property) => ({
  name: property.name.getText(source),
  node: property.initializer,
}));
const select = program
  .getSourceFile(selectPath)
  .statements.find(
    (statement) =>
      ts.isFunctionDeclaration(statement) && statement.name?.text === 'Select',
  );
entries.push({ name: 'Select', node: select });
const escape = (text) =>
  text.replaceAll('|', '\\|').replaceAll('\n', ' ').replaceAll('`', '&#96;');
const componentGuidance = {
  MiniCalendar: `
Use MiniCalendar for choosing one nearby date. The row pages by its visible day count and works with the same date-only ISO strings as Calendar. The selected day and the page can each be controlled independently. Supply a reference date when today must match across rendering environments.

Arrow keys move focus in the visual direction, Home and End move to the first and last available days, and Page Up and Page Down page by the day count. Enter and Space select the focused day. Date bounds and disabled dates apply to keyboard and pointer selection. Use locale and translated navigation labels for localized interfaces.
`,
  Toaster: `
Import \`createToaster\` from the Preact, React or Vue entry, or from \`@revolist/ui/toast-store\` with any adapter. Create a controller and mount one \`<Toaster toaster={toaster} />\` in the themed app or surface. Call \`toaster.show({ title, description, tone })\` from an event handler. It returns the ID for \`update(id, changes)\` and \`dismiss(id)\`. Call \`dismiss()\` to clear the queue.

Use \`toaster.promise(task, { loading, success, error })\` to update one notification as a promise settles. Each message takes toast options and success and error can derive their options from the settled value. The returned promise preserves the task result or rejection.

Notifications expire after four seconds by default. Loading notifications and notifications with actions stay visible by default. Pass \`duration: 0\` to keep other messages visible or set a duration in milliseconds. The timer pauses while the viewport is hovered or focused and while the document is hidden.

Use logical start and end positions for RTL layouts, or \`inline\` within a panel. Pass translated message text, action labels, and \`text.notifications\` and \`text.dismiss\` for the accessible names. Keyboard users can Tab into the actions and press Escape within a notification to dismiss it.
`,
  CircularSlider: `
## Angle and input

The dial uses degrees from zero at the top through 360 for a complete clockwise turn. Pass an angle with \`value\` to control it, or use \`defaultValue\` for local state. Set \`step\` for adjustment increments and supply \`formatValue\` to display another unit.

Use \`onValueChange\` for live updates and \`onValueCommit\` for completed pointer or keyboard adjustments. Arrow keys move one step, and Home and End reach the endpoints. Hold Shift with an arrow key, or use Page Up or Page Down, to move ten steps. Set \`name\` to submit the angle with a form.
`,
  Cursor: `
## Position and accessibility

Give the containing surface a positioning context, then pass the collaborator's offsets in CSS pixels through \`position\`. Enable \`animate\` to interpolate updates with the shared motion preferences. Hosts can subscribe to their presence service and pass coordinates, a name and a localized message as data.

Set the CSS color per collaborator. The label uses automatic contrast where available and a theme surface with an accent border elsewhere. The pointer is decorative and allows clicks through to the workspace. Hide the whole cursor from assistive technology with \`aria-hidden\` if a separate presence list already identifies that collaborator.
`,
  ActionBar: `
## Bulk selection

Pass the selection count and its localized summary. The bar opens when the count is positive. Use \`open\` to control visibility and clear your host selection in \`onOpenChange(false)\`. Use the optional children slot for extra controls such as a menu trigger.

The default is fixed to the bottom of the viewport. Allow enough room beneath the host content for rows to scroll clear of the bar. Use the inline mode for embedded layouts. Focus stays on the selection when the bar opens. Left and Right move between actions in writing order, and Home and End move to the ends.
`,
  BackupHistory: `
## Snapshot order

Supply snapshots from oldest to newest. The newest snapshot is initially selected, and the slider, buttons, arrow keys and touch track all change the same selection. The slider uses chronological left-to-right order, including in an RTL host.

Supply localized, display-ready dates, sizes and verification states. Mark unsuccessful or unavailable backups with \`restoreDisabled\`. Preview and confirmed restore callbacks receive the snapshot ID so the application can manage data and persistence.
`,
  HistoryReview: `
## Reviewing grid changes

Supply full snapshots newest first. Use stable cell IDs across revisions, including the sheet identity for multi-sheet workbooks. Addresses and display values are supplied by the host. Set a cell's value to \`null\` or omit its ID when the cell is empty. The comparison shows values before and after the selected revision, using either the preceding snapshot or the current version as the starting point.

Use \`labels.comparison\` for the visible and accessible switch label, and \`labels.previous\` and \`labels.current\` for its options. Set \`labels.changesTable\` to give the changes table a separate accessible name. The current-version badge, change counts, empty states, and restore labels can also be localized.

Supply an author name to show a shared avatar with initials. An optional \`authorAvatarUrl\` supplies the photo, with initials used if the photo cannot load.

Use the inline review for an audit panel or a comment's edit history. Pass \`open\` and \`onClose\` for a modal review. The optional restore handler receives the confirmed revision ID. The host can persist a new revision while retaining the earlier snapshots.
`,
  CommandPalette: `
## Command groups and keyboard

Provide a command's optional \`group\`, decorative \`icon\`, and \`shortcut\` to organize the list. A shortcut describes a key binding registered by your application. Use \`<kbd class="rv-keycap">⌘K</kbd>\` for the same keyboard hint style in a launcher or help text. Use \`inline\` for a persistent list, or control \`open\` and \`onClose\` for a dialog.

The field keeps keyboard focus while Up and Down move the highlighted option. Alt with Up or Down jumps between groups. Home and End reach the ends of the list. Enter runs the highlighted command, and Escape dismisses the dialog.
`,
  FileTree: `
## Selection and expansion

The selected file uses its relative path and exposes \`aria-current\`. Pass \`expanded\` with \`onExpandedChange\` to control open folders and implement Expand all or Collapse all. When omitted, folders open initially unless \`defaultExpanded\` specifies paths.

Use \`fileTreeFromPaths\` from \`@revolist/ui/file-tree\` to group and deduplicate flat relative file paths, such as the paths returned by completed write operations. Assign the optional \`added\`, \`modified\`, or \`deleted\` status on file nodes. The indicator's letter is part of the visible action name, and its localized description announces the full status.
`,
  Stepper: `
## Layout and state

Use \`orientation="horizontal"\`, \`orientation="vertical"\`, or the default responsive layout. Set \`dir="rtl"\` or inherit writing direction. Horizontal arrows follow writing direction and vertical arrows use Up and Down. Home and End move to the first and last enabled trigger. Arrow keys move focus. Enter and Space activate the focused step.

For a wizard, use \`defaultStep\` or controlled \`step\` and \`onStepChange\`. The number of \`steps\` determines the count. A step index equal to that count displays \`completedContent\`. Step content stays mounted while hidden. Pass localized \`previousLabel\` and \`nextLabel\` to render shared navigation buttons.

Existing ID-based consumers can continue using \`value\` with \`onValueChange\`. When omitted, the component owns its index. Use indexed state for a controlled workflow with a completion panel.

Use \`linear\` to restrict navigation to Back and Next. \`isStepValid\` checks forward moves and \`onStepInvalid\` lets the application surface errors. \`isStepSkippable\` bypasses optional steps during sequential navigation. Use \`busy\` to prevent navigation during asynchronous work. Each step can override its marker with a decorative icon and provide a separate title and description.

The list, indicator, title, description, panels and actions are exposed as CSS parts. Revo UI uses an array of step definitions in place of a compound component hierarchy.

## Accordion checklist

Set \`layout="accordion"\` to place each panel below its vertical step heading. The current step opens when progress changes. Users can open another heading to inspect it while the current step stays marked. The inline Back and Next buttons change progress and focus the new current step.

See the [Stepper examples](https://ui.rv-grid.com/components/stepper/) for a checklist, a validated workspace setup, and left-to-right and right-to-left navigation.
`,
};
const output = resolve(gallery, 'docs/api');
mkdirSync(output, { recursive: true });
let count = 0;
for (const { name, node } of entries) {
  if (
    process.env.UI_API_COMPONENTS &&
    !process.env.UI_API_COMPONENTS.split(',').includes(name)
  )
    continue;
  const type = checker.getTypeAtLocation(node);
  const signature = type.getCallSignatures()[0];
  if (!signature) throw new Error(`Missing props signature: ${name}`);
  const props = signature.parameters[0]
    ? checker.getTypeOfSymbolAtLocation(signature.parameters[0], node)
    : undefined;
  const allProperties = props ? checker.getPropertiesOfType(props) : [];
  const own = allProperties.filter((property) =>
    property.declarations?.some(
      (declaration) =>
        declaration
          .getSourceFile()
          .fileName.startsWith(resolve(library, 'package') + '/') ||
        /\/packages\/dates\/src\//.test(declaration.getSourceFile().fileName),
    ),
  );
  const group = routes.get(name);
  if (!group) throw new Error(`Missing group: ${name}`);
  let text = `# ${name}\n\n${group.description}\n\n[Live examples and formatted usage](https://ui.rv-grid.com/components/${group.route}/${group.anchor ? '#' + group.anchor : ''}) · [Component index](../../README.md#complete-component-reference)\n\n`;
  const directEntries = {
    LookupField: 'dropdown/lookup-field',
    NumberDraft: 'number-input',
    MaskedDraft: 'masked-input',
    DurationField: 'duration',
    DurationDraft: 'duration',
    HtmlEditor: 'rich-text',
    TemporalPicker: 'date-time',
    TemporalDraft: 'date-time',
    DateTimeField: 'date-time',
    AssigneePicker: 'assignee',
    AssigneeField: 'assignee',
    AssigneePickerLayout: 'assignee',
  };
  if (name !== 'Select')
    text += `Preact: \`import { ${name} } from '@revolist/ui/${directEntries[name] ?? 'preact'}'\`\n\n`;
  if (name === 'Select')
    text +=
      'Direct Preact entry: `@revolist/ui/select`. For other framework adapters use `Dropdown`, `Combobox`, or `MultiSelect`.\n\n';
  else
    text += `React: \`import { ${name} } from '@revolist/ui/react'\`\n\nVue: \`import { ${name} } from '@revolist/ui/vue'\`\n\nAngular/Svelte: pass \`component="${name}"\` to the framework's \`UiComponent\` host. See the [framework guides](https://ui.rv-grid.com/frameworks/) for state, callbacks and slots.\n\n`;
  text +=
    '## Props\n\nThe table lists library-declared props. Standard inherited HTML attributes are omitted to keep the reference focused. Callback and generic types follow the installed package declarations.\n\n| Prop | Type | Required | Description |\n| --- | --- | --- | --- |\n';
  for (const property of own) {
    const declaration = property.valueDeclaration ?? property.declarations[0];
    const valueType = checker.typeToString(
      checker.getTypeOfSymbolAtLocation(property, declaration),
      declaration,
      ts.TypeFormatFlags.NoTruncation |
        ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
    );
    const description = ts.displayPartsToString(
      property.getDocumentationComment(checker),
    );
    text += `| \`${escape(property.name)}\` | \`${escape(valueType)}\` | ${property.flags & ts.SymbolFlags.Optional ? 'No' : 'Yes'} | ${escape(description)} |\n`;
  }
  if (!own.length)
    text +=
      '| — | No component-specific props listed | — | See the linked examples and package declarations. |\n';
  text +=
    '\n## Composition\n\nKeep controlled values and side effects in your application. Use the matching framework adapter rather than passing another framework’s VNodes through Preact callbacks. The live page groups this control with related variants and composition helpers.\n\nThis reference is generated from the local `package` library source. Rebuild it with `node scripts/generate-api.mjs`.\n';
  text += componentGuidance[name] ?? '';
  writeFileSync(resolve(output, `${name}.md`), text);
  count++;
}
console.log(
  `Generated ${count} component API references from TypeScript declarations.`,
);
